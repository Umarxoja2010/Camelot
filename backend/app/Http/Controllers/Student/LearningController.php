<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceResource;
use App\Http\Resources\GradeResource;
use App\Http\Resources\GroupResource;
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

    /** O'quvchining davomati. */
    public function attendance(Request $request)
    {
        $query = $request->user()->attendances()->with('group');

        if ($groupId = $request->query('group_id')) {
            $query->where('group_id', $groupId);
        }

        return AttendanceResource::collection($query->latest('date')->limit(200)->get());
    }

    /** O'quvchining baholari. */
    public function grades(Request $request)
    {
        $query = $request->user()->grades()->with('group');

        if ($groupId = $request->query('group_id')) {
            $query->where('group_id', $groupId);
        }

        return GradeResource::collection($query->latest('date')->limit(200)->get());
    }
}
