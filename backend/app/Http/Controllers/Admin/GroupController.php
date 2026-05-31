<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreGroupRequest;
use App\Http\Requests\Admin\UpdateGroupRequest;
use App\Http\Resources\GroupResource;
use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class GroupController extends Controller
{
    public function index(Request $request)
    {
        $query = Group::query()->with('course', 'teacher')->withCount('students');

        if ($courseId = $request->query('course_id')) {
            $query->where('course_id', $courseId);
        }

        if ($teacherId = $request->query('teacher_id')) {
            $query->where('teacher_id', $teacherId);
        }

        return GroupResource::collection($query->latest()->get());
    }

    public function store(StoreGroupRequest $request)
    {
        $data = $request->validated();
        $group = Group::create($data);

        if (! empty($data['student_ids'])) {
            $this->syncStudents($group, $data['student_ids']);
        }

        return (new GroupResource($group->load('course', 'teacher')->loadCount('students')))
            ->response()->setStatusCode(201);
    }

    public function show(Group $group)
    {
        $group->load('course', 'teacher', 'students');

        return new GroupResource($group);
    }

    public function update(UpdateGroupRequest $request, Group $group)
    {
        $data = $request->validated();
        $group->update($data);

        if (array_key_exists('student_ids', $data)) {
            $this->syncStudents($group, $data['student_ids'] ?? []);
        }

        return new GroupResource($group->fresh()->load('course', 'teacher')->loadCount('students'));
    }

    public function destroy(Group $group)
    {
        $group->delete();

        return response()->json(['message' => 'Guruh o\'chirildi.']);
    }

    /**
     * Guruhga o'quvchilarni yozish (mavjudlarni saqlab).
     */
    public function enroll(Request $request, Group $group)
    {
        $validated = $request->validate([
            'student_ids' => ['required', 'array'],
            'student_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $pivot = collect($validated['student_ids'])->mapWithKeys(fn ($id) => [
            $id => ['status' => 'active', 'enrolled_at' => Carbon::today()],
        ])->all();

        $group->students()->syncWithoutDetaching($pivot);

        return new GroupResource($group->fresh()->load('students'));
    }

    /**
     * O'quvchini guruhdan chiqarish.
     */
    public function removeStudent(Group $group, int $studentId)
    {
        $group->students()->detach($studentId);

        return response()->json(['message' => 'O\'quvchi guruhdan chiqarildi.']);
    }

    private function syncStudents(Group $group, array $studentIds): void
    {
        $pivot = collect($studentIds)->mapWithKeys(fn ($id) => [
            $id => ['status' => 'active', 'enrolled_at' => Carbon::today()],
        ])->all();

        $group->students()->sync($pivot);
    }
}
