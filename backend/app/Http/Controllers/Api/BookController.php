<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BookRequest;
use App\Http\Resources\BookResource;
use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $query = Book::with('category')->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('author', 'like', "%{$s}%")
                  ->orWhere('isbn', 'like', "%{$s}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return BookResource::collection($query->paginate(10));
    }

    public function store(BookRequest $request)
    {
        $book = Book::create($request->validated());

        return (new BookResource($book->load('category')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Book $book)
    {
        return new BookResource($book->load('category'));
    }

    public function update(BookRequest $request, Book $book)
    {
        $book->update($request->validated());

        return new BookResource($book->load('category'));
    }

    public function destroy(Book $book)
    {
        $book->delete();

        return response()->noContent(); // 204
    }
}