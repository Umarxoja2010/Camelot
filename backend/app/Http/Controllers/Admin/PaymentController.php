<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Notification;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::query()->with('student', 'group', 'card');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($studentId = $request->query('student_id')) {
            $query->where('student_id', $studentId);
        }

        if ($month = $request->query('month')) {
            $query->where('month', $month);
        }

        $perPage = min((int) $request->query('per_page', 20), 100);

        return PaymentResource::collection($query->latest()->paginate($perPage));
    }

    public function show(Payment $payment)
    {
        return new PaymentResource($payment->load('student', 'group', 'card', 'reviewer'));
    }

    public function confirm(Request $request, Payment $payment)
    {
        return $this->review($request, $payment, Payment::STATUS_CONFIRMED);
    }

    public function reject(Request $request, Payment $payment)
    {
        return $this->review($request, $payment, Payment::STATUS_REJECTED);
    }

    private function review(Request $request, Payment $payment, string $status): JsonResponse
    {
        $validated = $request->validate([
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $payment->update([
            'status' => $status,
            'note' => $validated['note'] ?? $payment->note,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        // O'quvchiga bildirishnoma
        $isConfirmed = $status === Payment::STATUS_CONFIRMED;
        Notification::create([
            'user_id' => $payment->student_id,
            'type' => 'payment',
            'title' => $isConfirmed ? 'To\'lov tasdiqlandi' : 'To\'lov rad etildi',
            'body' => $isConfirmed
                ? "{$payment->month} oyi uchun to'lovingiz tasdiqlandi."
                : "{$payment->month} oyi uchun to'lovingiz rad etildi. ".($validated['note'] ?? ''),
            'data' => ['payment_id' => $payment->id, 'status' => $status],
        ]);

        return response()->json([
            'message' => $isConfirmed ? 'To\'lov tasdiqlandi.' : 'To\'lov rad etildi.',
            'data' => new PaymentResource($payment->fresh()->load('student', 'group', 'card')),
        ]);
    }
}
