<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login — token qaytaradi. Hisoblar admin tomonidan yaratiladi.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email yoki parol noto\'g\'ri.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Hisobingiz faol emas. Administrator bilan bog\'laning.'],
            ]);
        }

        $token = $user->createToken($request->input('device_name', 'web'))->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function me(Request $request): UserResource
    {
        $user = $request->user();

        if ($user->isParent()) {
            $user->load('children');
        }

        return new UserResource($user);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Tizimdan chiqdingiz.']);
    }

    /**
     * O'z profilini yangilash (ism, telefon, til, parol, telegram).
     */
    public function updateProfile(Request $request): UserResource
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'locale' => ['sometimes', Rule::in(config('app.supported_locales', ['uz', 'ru', 'en']))],
            'telegram_chat_id' => ['sometimes', 'nullable', 'string', 'max:50'],
            'current_password' => ['required_with:password', 'nullable', 'string'],
            'password' => ['sometimes', 'nullable', 'string', 'min:6', 'confirmed'],
        ]);

        // Parolni o'zgartirish
        if (! empty($validated['password'])) {
            if (! Hash::check($validated['current_password'] ?? '', $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['Joriy parol noto\'g\'ri.'],
                ]);
            }
            $user->password = $validated['password'];
        }

        $user->fill(array_filter(
            collect($validated)->only(['name', 'phone', 'locale', 'telegram_chat_id'])->toArray(),
            fn ($v) => $v !== null,
        ));

        $user->save();

        return new UserResource($user->fresh());
    }
}
