<?php

namespace App\Http\Controllers;

use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /** Joriy foydalanuvchining bildirishnomalari. */
    public function index(Request $request)
    {
        $items = $request->user()
            ->appNotifications()
            ->latest()
            ->limit(50)
            ->get();

        return NotificationResource::collection($items);
    }

    /** O'qilmagan bildirishnomalar soni. */
    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'count' => $request->user()->appNotifications()->unread()->count(),
        ]);
    }

    /** Bittasini o'qilgan deb belgilash. */
    public function markRead(Request $request, Notification $notification): JsonResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 403);

        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'O\'qilgan deb belgilandi.']);
    }

    /** Hammasini o'qilgan deb belgilash. */
    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->appNotifications()->unread()->update(['read_at' => now()]);

        return response()->json(['message' => 'Barchasi o\'qilgan deb belgilandi.']);
    }
}
