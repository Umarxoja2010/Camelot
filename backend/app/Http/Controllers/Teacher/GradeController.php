<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Concerns\AuthorizesGroupAccess;
use App\Http\Controllers\Controller;
use App\Http\Resources\GradeResource;
use App\Models\Grade;
use App\Models\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GradeController extends Controller
{
    use AuthorizesGroupAccess;

    /** Guruh baholari (ixtiyoriy: student_id, type bo'yicha filtr). */
    public function index(Request $request, Group $group)
    {
        $this->authorizeGroup($request->user(), $group);

        $query = Grade::where('group_id', $group->id)->with('student');

        if ($studentId = $request->query('student_id')) {
            $query->where('student_id', $studentId);
        }

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        return GradeResource::collection($query->latest('date')->get());
    }

    /** Baho qo'yish. */
    public function store(Request $request, Group $group)
    {
        $this->authorizeGroup($request->user(), $group);

        $validated = $request->validate([
            'student_id' => ['required', 'integer', 'exists:users,id'],
            'type' => ['required', Rule::in(Grade::TYPES)],
            'title' => ['nullable', 'string', 'max:255'],
            'score' => ['required', 'numeric', 'min:0'],
            'max_score' => ['nullable', 'numeric', 'min:1'],
            'date' => ['required', 'date'],
            'comment' => ['nullable', 'string', 'max:500'],
        ]);

        $grade = Grade::create([
            ...$validated,
            'group_id' => $group->id,
            'max_score' => $validated['max_score'] ?? 100,
            'graded_by' => $request->user()->id,
        ]);

        return (new GradeResource($grade->load('student')))->response()->setStatusCode(201);
    }

    /** Bahoni o'chirish. */
    public function destroy(Request $request, Grade $grade): JsonResponse
    {
        $this->authorizeGroup($request->user(), $grade->group);

        $grade->delete();

        return response()->json(['message' => 'Baho o\'chirildi.']);
    }
}
