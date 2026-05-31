<?php

namespace App\Http\Requests\Admin;

use App\Models\Announcement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'array'],
            'title.uz' => ['required', 'string', 'max:255'],
            'title.ru' => ['nullable', 'string', 'max:255'],
            'title.en' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'array'],
            'body.uz' => ['required', 'string', 'max:5000'],
            'body.ru' => ['nullable', 'string', 'max:5000'],
            'body.en' => ['nullable', 'string', 'max:5000'],
            'audience' => ['required', Rule::in(Announcement::AUDIENCES)],
            'group_id' => ['nullable', 'required_if:audience,group', 'integer', 'exists:groups,id'],
            'is_published' => ['boolean'],
            'notify' => ['boolean'], // bildirishnoma yuborilsinmi
        ];
    }
}
