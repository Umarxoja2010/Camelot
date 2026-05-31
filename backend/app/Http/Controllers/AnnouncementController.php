<?php

namespace App\Http\Controllers;

use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * Joriy foydalanuvchiga tegishli e'lonlar tasmasi.
     */
    public function feed(Request $request)
    {
        $user = $request->user();

        // Rolga mos auditoriyalar
        $audiences = [Announcement::AUDIENCE_ALL];
        $audiences[] = match ($user->role) {
            User::ROLE_TEACHER => Announcement::AUDIENCE_TEACHERS,
            User::ROLE_STUDENT => Announcement::AUDIENCE_STUDENTS,
            default => Announcement::AUDIENCE_ALL,
        };

        $groupIds = $this->relevantGroupIds($user);

        $items = Announcement::query()
            ->with('group', 'publisher')
            ->where('is_published', true)
            ->where(function ($q) use ($audiences, $groupIds) {
                $q->whereIn('audience', $audiences);
                if (! empty($groupIds)) {
                    $q->orWhere(function ($q2) use ($groupIds) {
                        $q2->where('audience', Announcement::AUDIENCE_GROUP)
                            ->whereIn('group_id', $groupIds);
                    });
                }
            })
            ->latest()
            ->limit(100)
            ->get();

        return AnnouncementResource::collection($items);
    }

    /**
     * Foydalanuvchi bog'liq bo'lgan guruh id'lari.
     *
     * @return array<int, int>
     */
    private function relevantGroupIds(User $user): array
    {
        return match ($user->role) {
            User::ROLE_TEACHER => Group::where('teacher_id', $user->id)->pluck('id')->all(),
            User::ROLE_STUDENT => $user->groups()->pluck('groups.id')->all(),
            default => [],
        };
    }
}
