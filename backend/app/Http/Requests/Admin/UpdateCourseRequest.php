<?php

namespace App\Http\Requests\Admin;

class UpdateCourseRequest extends StoreCourseRequest
{
    public function rules(): array
    {
        $rules = parent::rules();

        $rules['name'] = ['sometimes', 'array'];
        $rules['name.uz'] = ['sometimes', 'required', 'string', 'max:255'];

        return $rules;
    }
}
