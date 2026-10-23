<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FineResource;
use App\Models\Fine;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class FineController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Fine::with(['borrowRecord.book', 'borrowRecord.user'])->latest();

        if (! $user->isAdmin()) {
            $query->whereHas('borrowRecord', fn ($q) => $q->where('user_id', $user->id));
        }

        if ($request->filled('is_paid')) {
            $query->where('is_paid', $request->boolean('is_paid'));
        }

        return FineResource::collection($query->paginate(10));
    }

    // Admin only
    public function pay(Fine $fine)
    {
        if ($fine->is_paid) {
            throw ValidationException::withMessages([
                'is_paid' => ['This fine is already paid.'],
            ]);
        }

        $fine->update(['is_paid' => true]);

        return new FineResource($fine->load(['borrowRecord.book', 'borrowRecord.user']));
    }
}