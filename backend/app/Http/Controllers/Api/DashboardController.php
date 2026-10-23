<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BorrowRecord;
use App\Models\Category;
use App\Models\Fine;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $today = today();

        if ($user->isAdmin()) {
            return response()->json([
                'role' => 'admin',
                'total_books' => Book::count(),
                'total_categories' => Category::count(),
                'pending_requests' => BorrowRecord::where('status', 'requested')->count(),
                'currently_borrowed' => BorrowRecord::where('status', 'borrowed')->count(),
                'overdue' => BorrowRecord::where('status', 'borrowed')->whereDate('due_date', '<', $today)->count(),
                'returned_this_week' => BorrowRecord::where('status', 'returned')
                    ->where('returned_at', '>=', now()->startOfWeek())->count(),
                'unpaid_fines_total' => (float) Fine::where('is_paid', false)->sum('amount'),
            ]);
        }

        $mine = BorrowRecord::where('user_id', $user->id);

        return response()->json([
            'role' => 'student',
            'pending_requests' => (clone $mine)->where('status', 'requested')->count(),
            'currently_borrowed' => (clone $mine)->where('status', 'borrowed')->count(),
            'overdue' => (clone $mine)->where('status', 'borrowed')->whereDate('due_date', '<', $today)->count(),
            'unpaid_fines_total' => (float) Fine::where('is_paid', false)
                ->whereHas('borrowRecord', fn ($q) => $q->where('user_id', $user->id))->sum('amount'),
        ]);
    }
}