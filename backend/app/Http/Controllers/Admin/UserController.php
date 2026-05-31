<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        if ($search = trim((string) $request->query('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->query('per_page', 15), 100);

        return UserResource::collection($query->latest()->paginate($perPage));
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'role' => $data['role'],
            'locale' => $data['locale'] ?? config('app.locale'),
            'password' => $data['password'],
            'is_active' => $data['is_active'] ?? true,
            'telegram_chat_id' => $data['telegram_chat_id'] ?? null,
        ]);

        $this->syncRelations($user, $data);

        return (new UserResource($user->load('children')))->response()->setStatusCode(201);
    }

    public function show(User $user)
    {
        $user->load('children', 'parents', 'groups.course');

        return new UserResource($user);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        $user->fill(collect($data)->only(['name', 'email', 'phone', 'role', 'locale', 'is_active', 'telegram_chat_id'])->toArray());

        if (! empty($data['password'])) {
            $user->password = $data['password'];
        }

        $user->save();

        $this->syncRelations($user, $data);

        return new UserResource($user->fresh()->load('children'));
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->json(['message' => 'Foydalanuvchi o\'chirildi.']);
    }

    /**
     * Ota-ona uchun farzandlarni, o'quvchi uchun guruhlarni sinxronlash.
     */
    private function syncRelations(User $user, array $data): void
    {
        if ($user->isParent() && array_key_exists('child_ids', $data)) {
            $user->children()->sync($data['child_ids'] ?? []);
        }

        if ($user->isStudent() && array_key_exists('group_ids', $data)) {
            $pivot = collect($data['group_ids'] ?? [])->mapWithKeys(fn ($id) => [
                $id => ['status' => 'active', 'enrolled_at' => Carbon::today()],
            ])->all();

            $user->groups()->sync($pivot);
        }
    }
}
