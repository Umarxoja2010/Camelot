<?php

namespace App\Http\Resources;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Payment
 */
class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'group_id' => $this->group_id,
            'amount' => (float) $this->amount,
            'month' => $this->month,
            'status' => $this->status,
            'note' => $this->note,
            'receipt_url' => $this->receipt_url,
            'reviewed_at' => $this->reviewed_at,
            'student' => new UserResource($this->whenLoaded('student')),
            'group' => new GroupResource($this->whenLoaded('group')),
            'card' => new PaymentCardResource($this->whenLoaded('card')),
            'created_at' => $this->created_at,
        ];
    }
}
