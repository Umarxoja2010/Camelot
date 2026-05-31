<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Concerns\AuthorizesGroupAccess;
use App\Http\Controllers\Controller;
use App\Http\Resources\GroupResource;
use App\Models\Group;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    use AuthorizesGroupAccess;

    /** O'qituvchining o'z guruhlari (admin uchun barchasi). */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Group::query()->with('course', 'teacher')->withCount('students');

        if (! $user->isAdmin()) {
            $query->where('teacher_id', $user->id);
        }

        return GroupResource::collection($query->latest()->get());
    }

    /** Guruh + o'quvchilari. */
    public function show(Request $request, Group $group)
    {
        $this->authorizeGroup($request->user(), $group);

        $group->load('course', 'teacher', 'students');

        return new GroupResource($group);
    }
}
