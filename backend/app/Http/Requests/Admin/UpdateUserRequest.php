<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['sometimes', Rule::in(User::ROLES)],
            'locale' => ['nullable', Rule::in(config('app.supported_locales', ['uz', 'ru', 'en']))],
            'password' => ['nullable', 'string', 'min:6'],
            'is_active' => ['boolean'],
            'telegram_chat_id' => ['nullable', 'string', 'max:50'],
            'child_ids' => ['nullable', 'array'],
            'child_ids.*' => ['integer', 'exists:users,id'],
            'group_ids' => ['nullable', 'array'],
            'group_ids.*' => ['integer', 'exists:groups,id'],
        ];
    }
}
