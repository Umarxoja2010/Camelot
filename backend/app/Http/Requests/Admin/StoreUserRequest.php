<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // ruxsat 'role:admin' middleware orqali
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['required', Rule::in(User::ROLES)],
            'locale' => ['nullable', Rule::in(config('app.supported_locales', ['uz', 'ru', 'en']))],
            'password' => ['required', 'string', 'min:6'],
            'is_active' => ['boolean'],
            'telegram_chat_id' => ['nullable', 'string', 'max:50'],
            // Ota-ona uchun farzandlar (student id'lari)
            'child_ids' => ['nullable', 'array'],
            'child_ids.*' => ['integer', 'exists:users,id'],
            // O'quvchi uchun guruhlar
            'group_ids' => ['nullable', 'array'],
            'group_ids.*' => ['integer', 'exists:groups,id'],
        ];
    }
}
