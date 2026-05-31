<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Concerns\AuthorizesGroupAccess;
use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use App\Models\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    use AuthorizesGroupAccess;

    /**
     * Guruhning ma'lum sanadagi davomati.
     * ?date=YYYY-MM-DD (default bugun)
     */
    public function index(Request $request, Group $group)
    {
        $this->authorizeGroup($request->user(), $group);

        $date = $request->query('date', now()->toDateString());

        $records = Attendance::where('group_id', $group->id)
            ->whereDate('date', $date)
            ->with('student')
            ->get();

        return AttendanceResource::collection($records);
    }

    /**
     * Davomatni saqlash (bir guruh, bir sana, ko'p o'quvchi).
     * Body: { date, records: [{student_id, status, note?}] }
     */
    public function store(Request $request, Group $group): JsonResponse
    {
        $this->authorizeGroup($request->user(), $group);

        $validated = $request->validate([
            'date' => ['required', 'date'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_id' => ['required', 'integer', 'exists:users,id'],
            'records.*.status' => ['required', Rule::in(Attendance::STATUSES)],
            'records.*.note' => ['nullable', 'string', 'max:255'],
        ]);

        foreach ($validated['records'] as $record) {
            Attendance::updateOrCreate(
                [
                    'group_id' => $group->id,
                    'student_id' => $record['student_id'],
                    'date' => $validated['date'],
                ],
                [
                    'status' => $record['status'],
                    'note' => $record['note'] ?? null,
                    'marked_by' => $request->user()->id,
                ]
            );
        }

        return response()->json([
            'message' => 'Davomat saqlandi.',
            'count' => count($validated['records']),
        ]);
    }
}
