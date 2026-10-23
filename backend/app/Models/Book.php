<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    /** @use HasFactory<\Database\Factories\BookFactory> */
    use HasFactory;

    protected $fillable = ['category_id', 'title', 'author', 'isbn', 'copies_available'];
    public function category() 
    { 
        return $this->belongsTo(Category::class); 
    }
    public function borrowRecords() 
    { 
        return $this->hasMany(BorrowRecord::class); 
    }
}
