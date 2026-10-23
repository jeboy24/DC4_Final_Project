<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BorrowRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'book_id', 'status',
        'borrowed_at', 'due_date', 'returned_at',
    ];

    protected function casts(): array
    {
        return [
            'borrowed_at' => 'date',
            'due_date' => 'date',
            'returned_at' => 'date',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function book() { return $this->belongsTo(Book::class); }
    public function fine() { return $this->hasOne(Fine::class); }

    public function isOverdue(): bool
    {
        return $this->status === 'borrowed'
            && $this->due_date
            && today()->gt($this->due_date);
    }
}