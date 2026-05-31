<?php

namespace App\Http\Requests\Admin;

class UpdateGroupRequest extends StoreGroupRequest
{
    public function rules(): array
    {
        $rules = parent::rules();

        $rules['course_id'] = ['sometimes', 'integer', 'exists:courses,id'];
        $rules['name'] = ['sometimes', 'string', 'max:255'];

        return $rules;
    }
}
