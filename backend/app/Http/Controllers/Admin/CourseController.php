<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourseRequest;
use App\Http\Requests\Admin\UpdateCourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::query()->withCount('groups');

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        return CourseResource::collection($query->latest()->get());
    }

    public function store(StoreCourseRequest $request)
    {
        $course = Course::create($request->validated());

        return (new CourseResource($course))->response()->setStatusCode(201);
    }

    public function show(Course $course)
    {
        $course->loadCount('groups');

        return new CourseResource($course);
    }

    public function update(UpdateCourseRequest $request, Course $course)
    {
        $course->update($request->validated());

        return new CourseResource($course->fresh());
    }

    public function destroy(Course $course)
    {
        $course->delete();

        return response()->json(['message' => 'Kurs o\'chirildi.']);
    }
}
