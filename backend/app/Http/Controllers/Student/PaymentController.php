<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentCardResource;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Models\PaymentCard;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /** Faol to'lov kartalari (o'quvchi shu kartaga to'laydi). */
    public function cards()
    {
        return PaymentCardResource::collection(PaymentCard::active()->get());
    }

    /** O'quvchining to'lovlari tarixi. */
    public function index(Request $request)
    {
        $payments = $request->user()
            ->payments()
            ->with('group', 'card')
            ->latest()
            ->get();

        return PaymentResource::collection($payments);
    }

    /** Chek yuklash (yangi to'lov yuborish). */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'month' => ['required', 'string', 'regex:/^\d{4}-\d{2}$/'], // YYYY-MM
            'payment_card_id' => ['nullable', 'integer', 'exists:payment_cards,id'],
            'group_id' => ['nullable', 'integer', 'exists:groups,id'],
            'note' => ['nullable', 'string', 'max:255'],
            'receipt' => ['required', 'image', 'max:5120'], // 5MB gacha rasm
        ]);

        $path = $request->file('receipt')->store('receipts', 'public');

        $payment = Payment::create([
            'student_id' => $request->user()->id,
            'group_id' => $validated['group_id'] ?? null,
            'payment_card_id' => $validated['payment_card_id'] ?? null,
            'amount' => $validated['amount'],
            'month' => $validated['month'],
            'receipt_path' => $path,
            'status' => Payment::STATUS_PENDING,
            'note' => $validated['note'] ?? null,
        ]);

        return (new PaymentResource($payment->load('group', 'card')))
            ->response()->setStatusCode(201);
    }
}
