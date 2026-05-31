<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceResource;
use App\Http\Resources\GroupResource;
use App\Http\Resources\HomeworkResource;
use App\Models\Homework;
use Illuminate\Http\Request;

class LearningController extends Controller
{
    /** O'quvchining guruhlari. */
    public function groups(Request $request)
    {
        $groups = $request->user()
            ->groups()
            ->with('course', 'teacher')
            ->get();

        return GroupResource::collection($groups);
    }

    /** O'quvchining davomati (keldi/kelmadi). */
    public function attendance(Request $request)
    {
        $query = $request->user()->attendances()->with('group.course');

        if ($groupId = $request->query('group_id')) {
            $query->where('group_id', $groupId);
        }

        return AttendanceResource::collection($query->latest('date')->limit(200)->get());
    }

    /** O'quvchiga berilgan uy vazifalari. */
    public function homework(Request $request)
    {
        $groupIds = $request->user()->groups()->pluck('groups.id');

        $items = Homework::whereIn('group_id', $groupIds)
            ->with('group.course')
            ->latest()
            ->limit(100)
            ->get();

        return HomeworkResource::collection($items);
    }
}
