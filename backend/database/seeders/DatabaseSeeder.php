<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\BorrowRecord;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Maria Santos',
            'email' => 'librarian@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $student = User::create([
            'name' => 'James Aaron Asur',
            'email' => 'student@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'student',
        ]);

        $cats = collect(['Fiction', 'Science', 'History', 'Mathematics', 'Filipiana'])
            ->mapWithKeys(fn ($n) => [$n => Category::create(['name' => $n])]);

        $books = [
            ['Noli Me Tangere', 'Jose Rizal', 'Filipiana'],
            ['El Filibusterismo', 'Jose Rizal', 'Filipiana'],
            ['Ibong Adarna', 'Anonymous', 'Filipiana'],
            ['Florante at Laura', 'Francisco Balagtas', 'Filipiana'],
            ['The Hobbit', 'J.R.R. Tolkien', 'Fiction'],
            ['Charlotte\'s Web', 'E.B. White', 'Fiction'],
            ['Holes', 'Louis Sachar', 'Fiction'],
            ['Matilda', 'Roald Dahl', 'Fiction'],
            ['A Brief History of Time', 'Stephen Hawking', 'Science'],
            ['The Magic School Bus: Inside the Earth', 'Joanna Cole', 'Science'],
            ['Cosmos', 'Carl Sagan', 'Science'],
            ['Basic Biology', 'Maria Reyes', 'Science'],
            ['Philippine History', 'Teodoro Agoncillo', 'History'],
            ['World War II Illustrated', 'John Keegan', 'History'],
            ['Ancient Civilizations', 'Peter James', 'History'],
            ['Geometry Made Easy', 'Ana Lim', 'Mathematics'],
            ['Algebra Essentials', 'Robert Cruz', 'Mathematics'],
            ['Mathematics for Grade 10', 'DepEd', 'Mathematics'],
            ['The Joy of Mathematics', 'Theoni Pappas', 'Mathematics'],
            ['Trigonometry Basics', 'Luis Garcia', 'Mathematics'],
        ];

        foreach ($books as $i => [$title, $author, $cat]) {
            Book::create([
                'category_id' => $cats[$cat]->id,
                'title' => $title,
                'author' => $author,
                'isbn' => '978-971-' . str_pad($i + 1, 5, '0', STR_PAD_LEFT),
                'copies_available' => rand(2, 6),
            ]);
        }

        BorrowRecord::create(['user_id' => $student->id, 'book_id' => 1, 'status' => 'requested']);
        BorrowRecord::create([
            'user_id' => $student->id, 'book_id' => 5, 'status' => 'borrowed',
            'borrowed_at' => now()->subDays(3), 'due_date' => now()->addDays(4),
        ]);
        BorrowRecord::create([
            'user_id' => $student->id, 'book_id' => 9, 'status' => 'returned',
            'borrowed_at' => now()->subDays(20), 'due_date' => now()->subDays(13),
            'returned_at' => now()->subDays(12),
        ]);
    }
}