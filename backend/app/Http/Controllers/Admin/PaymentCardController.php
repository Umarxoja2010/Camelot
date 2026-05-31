<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentCardResource;
use App\Models\PaymentCard;
use Illuminate\Http\Request;

class PaymentCardController extends Controller
{
    public function index()
    {
        return PaymentCardResource::collection(PaymentCard::latest()->get());
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $card = PaymentCard::create($data);

        return (new PaymentCardResource($card))->response()->setStatusCode(201);
    }

    public function update(Request $request, PaymentCard $paymentCard)
    {
        $data = $this->validateData($request);
        $paymentCard->update($data);

        return new PaymentCardResource($paymentCard->fresh());
    }

    public function destroy(PaymentCard $paymentCard)
    {
        $paymentCard->delete();

        return response()->json(['message' => 'Karta o\'chirildi.']);
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'bank_name' => ['required', 'string', 'max:100'],
            'card_number' => ['required', 'string', 'max:30'],
            'holder_name' => ['required', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);
    }
}
