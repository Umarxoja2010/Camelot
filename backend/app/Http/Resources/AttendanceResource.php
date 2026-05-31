<?php

namespace App\Http\Resources;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Attendance
 */
class AttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'group_id' => $this->group_id,
            'student_id' => $this->student_id,
            'date' => $this->date?->toDateString(),
            'status' => $this->status,
            'note' => $this->note,
            'student' => new UserResource($this->whenLoaded('student')),
            'group' => new GroupResource($this->whenLoaded('group')),
        ];
    }
}
