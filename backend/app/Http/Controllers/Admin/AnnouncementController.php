<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAnnouncementRequest;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use App\Models\Group;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Support\Collection;

class AnnouncementController extends Controller
{
    public function index()
    {
        $items = Announcement::with('group', 'publisher')->latest()->get();

        return AnnouncementResource::collection($items);
    }

    public function store(StoreAnnouncementRequest $request, NotificationService $notifications)
    {
        $data = $request->validated();

        $announcement = Announcement::create([
            'title' => $data['title'],
            'body' => $data['body'],
            'audience' => $data['audience'],
            'group_id' => $data['audience'] === Announcement::AUDIENCE_GROUP ? ($data['group_id'] ?? null) : null,
            'is_published' => $data['is_published'] ?? true,
            'published_by' => $request->user()->id,
        ]);

        // Bildirishnoma yuborish (ilova ichi + Telegram/SMS)
        if (($data['notify'] ?? true) && $announcement->is_published) {
            $recipients = $this->resolveRecipients($announcement);
            $notifications->sendMany(
                $recipients,
                $announcement->translate('title'),
                $announcement->translate('body'),
                'announcement',
                ['announcement_id' => $announcement->id],
            );
        }

        return (new AnnouncementResource($announcement->load('group', 'publisher')))
            ->response()->setStatusCode(201);
    }

    public function show(Announcement $announcement)
    {
        return new AnnouncementResource($announcement->load('group', 'publisher'));
    }

    public function update(StoreAnnouncementRequest $request, Announcement $announcement)
    {
        $data = $request->validated();
        $announcement->update([
            'title' => $data['title'],
            'body' => $data['body'],
            'audience' => $data['audience'],
            'group_id' => $data['audience'] === Announcement::AUDIENCE_GROUP ? ($data['group_id'] ?? null) : null,
            'is_published' => $data['is_published'] ?? $announcement->is_published,
        ]);

        return new AnnouncementResource($announcement->fresh()->load('group', 'publisher'));
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return response()->json(['message' => 'E\'lon o\'chirildi.']);
    }

    /**
     * Auditoriyaga qarab qabul qiluvchilarni aniqlash.
     *
     * @return Collection<int, User>
     */
    private function resolveRecipients(Announcement $announcement): Collection
    {
        return match ($announcement->audience) {
            Announcement::AUDIENCE_ALL => User::where('is_active', true)->get(),
            Announcement::AUDIENCE_TEACHERS => User::role(User::ROLE_TEACHER)->where('is_active', true)->get(),
            Announcement::AUDIENCE_STUDENTS => User::role(User::ROLE_STUDENT)->where('is_active', true)->get(),
            Announcement::AUDIENCE_PARENTS => User::role(User::ROLE_PARENT)->where('is_active', true)->get(),
            Announcement::AUDIENCE_GROUP => $this->groupRecipients($announcement->group_id),
            default => collect(),
        };
    }

    private function groupRecipients(?int $groupId): Collection
    {
        if (! $groupId) {
            return collect();
        }

        $group = Group::with('students.parents', 'teacher')->find($groupId);
        if (! $group) {
            return collect();
        }

        $recipients = $group->students; // o'quvchilar

        // O'quvchilarning ota-onalari
        $parents = $group->students->flatMap(fn (User $s) => $s->parents);

        // O'qituvchi
        $recipients = $recipients->merge($parents);
        if ($group->teacher) {
            $recipients->push($group->teacher);
        }

        return $recipients->unique('id')->values();
    }
}
