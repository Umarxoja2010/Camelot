<?php

namespace App\Http\Resources;

use App\Models\PaymentCard;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin PaymentCard
 */
class PaymentCardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'bank_name' => $this->bank_name,
            'card_number' => $this->card_number,
            'holder_name' => $this->holder_name,
            'note' => $this->note,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at,
        ];
    }
}
