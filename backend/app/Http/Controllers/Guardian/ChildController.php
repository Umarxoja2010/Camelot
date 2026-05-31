<?php

namespace App\Http\Controllers\Guardian;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceResource;
use App\Http\Resources\GradeResource;
use App\Http\Resources\GroupResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class ChildController extends Controller
{
    /** Ota-onaning farzandlari. */
    public function index(Request $request)
    {
        return UserResource::collection($request->user()->children);
    }

    /** Farzandning guruhlari. */
    public function groups(Request $request, int $child)
    {
        $student = $this->resolveChild($request, $child);

        return GroupResource::collection($student->groups()->with('course', 'teacher')->get());
    }

    /** Farzandning davomati. */
    public function attendance(Request $request, int $child)
    {
        $student = $this->resolveChild($request, $child);

        return AttendanceResource::collection(
            $student->attendances()->with('group')->latest('date')->limit(200)->get()
        );
    }

    /** Farzandning baholari. */
    public function grades(Request $request, int $child)
    {
        $student = $this->resolveChild($request, $child);

        return GradeResource::collection(
            $student->grades()->with('group')->latest('date')->limit(200)->get()
        );
    }

    /**
     * Faqat o'z farzandini ko'rishga ruxsat (aks holda 403).
     */
    private function resolveChild(Request $request, int $childId): User
    {
        $child = $request->user()->children()->where('users.id', $childId)->first();

        abort_unless($child !== null, 403, 'Bu o\'quvchi sizning farzandingiz emas.');

        return $child;
    }
}
