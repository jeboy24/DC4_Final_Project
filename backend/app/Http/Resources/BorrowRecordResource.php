<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BorrowRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'borrowed_at' => $this->borrowed_at?->toDateString(),
            'due_date' => $this->due_date?->toDateString(),
            'returned_at' => $this->returned_at?->toDateString(),
            'is_overdue' => $this->isOverdue(),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'book' => $this->whenLoaded('book', fn () => new BookResource($this->book)),
            'fine' => $this->whenLoaded('fine', fn () => new FineResource($this->fine)),
            'created_at' => $this->created_at,
        ];
    }
}