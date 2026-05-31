<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'teacher_id' => ['nullable', 'integer', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'schedule' => ['nullable', 'array'],
            'schedule.*.day' => ['required_with:schedule', Rule::in(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])],
            'schedule.*.start' => ['required_with:schedule', 'string', 'max:5'],
            'schedule.*.end' => ['required_with:schedule', 'string', 'max:5'],
            'room' => ['nullable', 'string', 'max:50'],
            'starts_on' => ['nullable', 'date'],
            'is_active' => ['boolean'],
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['integer', 'exists:users,id'],
        ];
    }
}
