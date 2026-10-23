<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBorrowRecordRequest;
use App\Http\Requests\UpdateBorrowStatusRequest;
use App\Http\Resources\BorrowRecordResource;
use App\Models\Book;
use App\Models\BorrowRecord;
use App\Models\Fine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BorrowRecordController extends Controller
{
    const LOAN_DAYS = 7;
    const FINE_PER_DAY = 5;

    public function index(Request $request)
    {
        $user = $request->user();
        $query = BorrowRecord::with(['user', 'book.category', 'fine'])->latest();

        // Students only see their own records
        if (! $user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->whereHas('book', fn ($b) => $b->where('title', 'like', "%{$s}%"))
                  ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$s}%"));
            });
        }

        return BorrowRecordResource::collection($query->paginate(10));
    }

    public function store(StoreBorrowRecordRequest $request)
    {
        $user = $request->user();
        $book = Book::findOrFail($request->book_id);

        if ($book->copies_available < 1) {
            throw ValidationException::withMessages([
                'book_id' => ['No copies of this book are available right now.'],
            ]);
        }

        $alreadyActive = BorrowRecord::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->whereIn('status', ['requested', 'borrowed'])
            ->exists();

        if ($alreadyActive) {
            throw ValidationException::withMessages([
                'book_id' => ['You already have an active request or loan for this book.'],
            ]);
        }

        $record = BorrowRecord::create([
            'user_id' => $user->id,
            'book_id' => $book->id,
            'status' => 'requested',
        ]);

        return (new BorrowRecordResource($record->load(['user', 'book.category', 'fine'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, BorrowRecord $borrowRecord)
    {
        $user = $request->user();

        if (! $user->isAdmin() && $borrowRecord->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return new BorrowRecordResource($borrowRecord->load(['user', 'book.category', 'fine']));
    }

    // Admin only: Requested -> Borrowed -> Returned
    public function updateStatus(UpdateBorrowStatusRequest $request, BorrowRecord $borrowRecord)
    {
        $new = $request->status;
        $allowed = ['requested' => 'borrowed', 'borrowed' => 'returned'];

        if (($allowed[$borrowRecord->status] ?? null) !== $new) {
            throw ValidationException::withMessages([
                'status' => ["Cannot change status from {$borrowRecord->status} to {$new}."],
            ]);
        }

        DB::transaction(function () use ($borrowRecord, $new) {
            $book = Book::lockForUpdate()->find($borrowRecord->book_id);

            if ($new === 'borrowed') {
                if ($book->copies_available < 1) {
                    throw ValidationException::withMessages([
                        'status' => ['No copies available to lend.'],
                    ]);
                }

                $book->decrement('copies_available');
                $borrowRecord->update([
                    'status' => 'borrowed',
                    'borrowed_at' => today(),
                    'due_date' => today()->addDays(self::LOAN_DAYS),
                ]);
            } else {
                $book->increment('copies_available');
                $today = today();
                $borrowRecord->update([
                    'status' => 'returned',
                    'returned_at' => $today,
                ]);

                // Late return -> create a fine
                if ($today->gt($borrowRecord->due_date)) {
                    $daysLate = (int) $borrowRecord->due_date->diffInDays($today);
                    Fine::create([
                        'borrow_record_id' => $borrowRecord->id,
                        'amount' => $daysLate * self::FINE_PER_DAY,
                        'is_paid' => false,
                    ]);
                }
            }
        });

        return new BorrowRecordResource($borrowRecord->fresh(['user', 'book.category', 'fine']));
    }

    // Cancel a pending request (owner or admin)
    public function destroy(Request $request, BorrowRecord $borrowRecord)
    {
        $user = $request->user();

        if (! $user->isAdmin() && $borrowRecord->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($borrowRecord->status !== 'requested') {
            throw ValidationException::withMessages([
                'status' => ['Only pending requests can be cancelled.'],
            ]);
        }

        $borrowRecord->delete();

        return response()->noContent(); // 204
    }
}