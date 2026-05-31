<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Concerns\AuthorizesGroupAccess;
use App\Http\Controllers\Controller;
use App\Http\Resources\HomeworkResource;
use App\Models\Group;
use App\Models\Homework;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeworkController extends Controller
{
    use AuthorizesGroupAccess;

    /** Guruhga berilgan uy vazifalari. */
    public function index(Request $request, Group $group)
    {
        $this->authorizeGroup($request->user(), $group);

        $items = $group->homeworks()->with('creator')->latest()->get();

        return HomeworkResource::collection($items);
    }

    /** Yangi uy vazifasi berish (+ guruh o'quvchilariga bildirishnoma). */
    public function store(Request $request, Group $group, NotificationService $notifications)
    {
        $this->authorizeGroup($request->user(), $group);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'due_date' => ['nullable', 'date'],
        ]);

        $homework = $group->homeworks()->create([
            ...$validated,
            'created_by' => $request->user()->id,
        ]);

        // Guruh o'quvchilariga bildirishnoma
        $group->loadMissing('students');
        $notifications->sendMany(
            $group->students,
            'Yangi uy vazifasi: '.$homework->title,
            $homework->description,
            'homework',
            ['homework_id' => $homework->id, 'group_id' => $group->id],
        );

        return (new HomeworkResource($homework->load('creator')))
            ->response()->setStatusCode(201);
    }

    /** Uy vazifasini o'chirish. */
    public function destroy(Request $request, Homework $homework): JsonResponse
    {
        $this->authorizeGroup($request->user(), $homework->group);

        $homework->delete();

        return response()->json(['message' => 'Uy vazifasi o\'chirildi.']);
    }
}
