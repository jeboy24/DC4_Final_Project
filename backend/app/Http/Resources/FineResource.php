<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'borrow_record_id' => $this->borrow_record_id,
            'amount' => $this->amount,
            'is_paid' => $this->is_paid,
            'borrow_record' => $this->whenLoaded('borrowRecord', fn () => new BorrowRecordResource($this->borrowRecord)),
            'created_at' => $this->created_at,
        ];
    }
}