<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'locale' => $this->locale,
            'avatar' => $this->avatar,
            'is_active' => (bool) $this->is_active,
            'has_telegram' => ! empty($this->telegram_chat_id),
            'created_at' => $this->created_at,
        ];
    }
}
