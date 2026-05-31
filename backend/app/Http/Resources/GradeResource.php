<?php

namespace App\Http\Resources;

use App\Models\Grade;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Grade
 */
class GradeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $max = (float) $this->max_score ?: 100;
        $percent = $max > 0 ? round((float) $this->score / $max * 100) : null;

        return [
            'id' => $this->id,
            'group_id' => $this->group_id,
            'student_id' => $this->student_id,
            'type' => $this->type,
            'title' => $this->title,
            'score' => (float) $this->score,
            'max_score' => (float) $this->max_score,
            'percent' => $percent,
            'date' => $this->date?->toDateString(),
            'comment' => $this->comment,
            'student' => new UserResource($this->whenLoaded('student')),
            'group' => new GroupResource($this->whenLoaded('group')),
        ];
    }
}
