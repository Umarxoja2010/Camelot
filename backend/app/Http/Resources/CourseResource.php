<?php

namespace App\Http\Resources;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Course
 */
class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->translate('name'),
            'description' => $this->translate('description'),
            'name_translations' => $this->getTranslations('name'),
            'description_translations' => $this->getTranslations('description'),
            'type' => $this->type,
            'level' => $this->level,
            'monthly_fee' => (float) $this->monthly_fee,
            'is_active' => (bool) $this->is_active,
            'groups_count' => $this->whenCounted('groups'),
            'created_at' => $this->created_at,
        ];
    }
}
