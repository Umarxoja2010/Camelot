<?php

namespace App\Http\Resources;

use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Group
 */
class GroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'schedule' => $this->schedule ?? [],
            'room' => $this->room,
            'starts_on' => $this->starts_on?->toDateString(),
            'is_active' => (bool) $this->is_active,
            'course' => new CourseResource($this->whenLoaded('course')),
            'teacher' => new UserResource($this->whenLoaded('teacher')),
            'students' => UserResource::collection($this->whenLoaded('students')),
            'students_count' => $this->whenCounted('students'),
            'created_at' => $this->created_at,
        ];
    }
}
