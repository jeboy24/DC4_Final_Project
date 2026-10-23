# BookLend: School Library Borrowing System

BookLend is a web app that moves a school library from a paper logbook to online borrowing. Students search for books and request them online. The librarian approves requests, records returns, and tracks late-return fines, all in one place.

## Problem Statement

The library currently tracks borrowing in a paper logbook. This causes several problems:

- Staff cannot quickly see which books are available, overdue or unpaid.
- Students do not know whether a book is in until they visit the shelf.
- Finding who holds a book and when it is due means searching the logbook by hand.
- Late fines are computed by hand, which leads to disputes and lost records.
- Counting how many books were borrowed or returned takes too much manual work.

## Features

**Authentication**
- Register (students only), login, logout and current user with Laravel Sanctum tokens
- Role-based protection in both the API (middleware) and React (protected routes)

**Librarian (admin)**
- Dashboard: total books, categories, pending requests, currently borrowed, overdue, returned this week, unpaid fines
- Add, edit and delete books and categories
- Approve requests, mark books returned, cancel pending requests
- View fines and mark them paid
- Search and filter books and borrowings

**Student**
- Register and log in
- Browse and search books, filter by category
- Request a book that has copies available
- View own borrowings with status, due date and fines
- Cancel a request while it is still Requested
- Dashboard with own pending requests, loans, overdue books and unpaid fines

**General**
- Form validation in React and Laravel Form Requests, with errors shown under the fields
- Pagination on list pages
- Loading indicators, success and error messages, and a confirm step before deleting
- Responsive layout

## User Roles

| Feature | Librarian (admin) | Student |
|---|---|---|
| Register account | No (seeded account) | Yes |
| Login / logout | Yes | Yes |
| Dashboard | Yes (library-wide) | Yes (own figures) |
| View and search books | Yes | Yes |
| Manage books and categories (CRUD) | Yes | No (view only) |
| Request a book | No | Yes |
| View borrowings | All records | Own records only |
| Cancel a request | Yes | Own, only while Requested |
| Approve a request | Yes | No |
| Mark a book returned | Yes | No |
| View fines | All fines | Own fines only |
| Mark a fine paid | Yes | No |

## Status Workflow

A request moves forward only: **Requested → Borrowed → Returned**.

| From | To | Done by |
|---|---|---|
| (new request) | Requested | System, when a student requests a book |
| Requested | Borrowed | Librarian (borrowed and due dates are set, one copy is taken off the shelf) |
| Borrowed | Returned | Librarian (the copy is put back; a fine is created if the book is late) |
| Requested | Cancelled (record removed) | Student or librarian |

Rules:
- Returned is final and cannot be changed.
- The loan period is 7 days from the borrowed date.
- A book returned after its due date gets a fine of ₱5 for each late day.
- A student cannot request a book with no copies available, or one they already have requested or borrowed.
- The API rejects invalid transitions with a 422 response.

## Database

| Table | Main fields | Relationships |
|---|---|---|
| users | name, email, password, role (admin or student) | has many borrow records |
| categories | name | has many books |
| books | category_id, title, author, isbn, copies_available | belongs to a category; has many borrow records |
| borrow_records | user_id, book_id, status, borrowed_at, due_date, returned_at | belongs to a user and a book; has one fine |
| fines | borrow_record_id, amount, is_paid | belongs to a borrow record |

See `docs/erd.png` for the diagram.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React with Vite, React Router, Axios, Context API |
| Styling | Plain responsive CSS |
| Backend | Laravel (REST API), PHP |
| Authentication | Laravel Sanctum (token-based) |
| Database | MySQL |
| Tools | Git and GitHub, Thunder Client, Composer, npm |

## Project Structure

```
booklend/
├── README.md
├── docs/
│   ├── erd.png
│   ├── booklend-api.json
│   ├── slides.pdf
│   └── screenshots/
│
├── backend/                                  Laravel API
│   ├── .env.example
│   ├── artisan
│   ├── composer.json
│   ├── bootstrap/
│   │   └── app.php                           Middleware alias, JSON error handling
│   ├── routes/
│   │   └── api.php                           All API routes
│   ├── app/
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Category.php
│   │   │   ├── Book.php
│   │   │   ├── BorrowRecord.php
│   │   │   └── Fine.php
│   │   └── Http/
│   │       ├── Controllers/Api/
│   │       │   ├── AuthController.php
│   │       │   ├── CategoryController.php
│   │       │   ├── BookController.php
│   │       │   ├── BorrowRecordController.php
│   │       │   ├── FineController.php
│   │       │   └── DashboardController.php
│   │       ├── Middleware/
│   │       │   └── AdminMiddleware.php
│   │       ├── Requests/
│   │       │   ├── RegisterRequest.php
│   │       │   ├── LoginRequest.php
│   │       │   ├── CategoryRequest.php
│   │       │   ├── BookRequest.php
│   │       │   ├── StoreBorrowRecordRequest.php
│   │       │   └── UpdateBorrowStatusRequest.php
│   │       └── Resources/
│   │           ├── CategoryResource.php
│   │           ├── BookResource.php
│   │           ├── BorrowRecordResource.php
│   │           └── FineResource.php
│   └── database/
│       ├── migrations/                       users, categories, books, borrow_records, fines
│       └── seeders/
│           └── DatabaseSeeder.php            Demo accounts, categories, 20 books
│
└── frontend/                                 React + Vite app
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx                           Routes (public, logged-in, librarian-only)
        ├── index.css                         Responsive styles
        ├── api/
        │   └── axios.js                      Axios instance, token and 401 interceptors
        ├── context/
        │   └── AuthContext.jsx               Login state shared across the app
        ├── components/
        │   ├── Layout.jsx                    Navbar and page area
        │   ├── ProtectedRoute.jsx            Login and role check
        │   ├── FormInput.jsx                 Reusable input with error text
        │   ├── Button.jsx                    Reusable button with loading state
        │   ├── Modal.jsx                     Reusable dialog
        │   └── Pagination.jsx                Reusable page controls
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── Books.jsx
            ├── Borrowings.jsx
            ├── ManageBooks.jsx               Librarian only
            └── ManageCategories.jsx          Librarian only
```

## Setup

You need PHP, Composer, Node.js with npm, and MySQL (Laragon includes all of these). Set up the backend first, then the frontend. Both must be running at the same time.

## Backend Setup (Laravel API)

1. Open a terminal and go to the backend folder:
```bash
cd backend
```

2. Install the PHP packages:
```bash
composer install
```

3. Create your environment file and app key:
```bash
copy .env.example .env
php artisan key:generate
```
On macOS or Linux, use `cp` instead of `copy`.

4. Create an empty MySQL database named `booklend`, then check these lines in `backend/.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=booklend
DB_USERNAME=root
DB_PASSWORD=
```

5. Create the tables and add the demo data:
```bash
php artisan migrate --seed
```

6. Start the API server:
```bash
php artisan serve
```

The API runs at `http://127.0.0.1:8000`. Keep this terminal open.

## Frontend Setup (React)

1. Open a second terminal and go to the frontend folder:
```bash
cd frontend
```

2. Install the packages:
```bash
npm install
```

3. Create your environment file:
```bash
copy .env.example .env
```
It must contain:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

4. Start the app:
```bash
npm run dev
```

5. Open `http://localhost:5173` in your browser and log in with a demo account below.

## Demo Accounts

| Role | Name | Email | Password |
|---|---|---|---|
| Librarian (admin) | Maria Santos | librarian@gmail.com | password |
| Student | James Aaron Asur | student@gmail.com | password |

The seeder also creates 5 categories, 20 books and 3 sample borrow records.

## API Endpoints

All routes are prefixed with `/api`. "Auth" routes require a Sanctum token sent as `Authorization: Bearer <token>`. "Librarian" routes also require the admin role.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /register | Public | Register a student and return a token |
| POST | /login | Public | Log in and return a token |
| POST | /logout | Auth | Revoke the current token |
| GET | /user | Auth | Get the logged-in user |
| GET | /dashboard | Auth | Summary figures for the user's role |
| GET | /categories | Auth | List with search and pagination (`all=1` returns every category) |
| GET | /categories/{id} | Auth | View one category |
| POST | /categories | Librarian | Create a category |
| PUT | /categories/{id} | Librarian | Update a category |
| DELETE | /categories/{id} | Librarian | Delete a category |
| GET | /books | Auth | List with `search`, `category_id` and pagination |
| GET | /books/{id} | Auth | View one book |
| POST | /books | Librarian | Create a book |
| PUT | /books/{id} | Librarian | Update a book |
| DELETE | /books/{id} | Librarian | Delete a book |
| GET | /borrow-records | Auth | Own records for a student, all for the librarian; `status` and `search` filters, paginated |
| POST | /borrow-records | Auth | Request a book (`book_id`) |
| GET | /borrow-records/{id} | Auth | View one record (students: own only) |
| DELETE | /borrow-records/{id} | Auth | Cancel a request while it is still Requested |
| PATCH | /borrow-records/{id}/status | Librarian | Move Requested to Borrowed, or Borrowed to Returned |
| GET | /fines | Auth | Own fines for a student, all for the librarian; `is_paid` filter, paginated |
| PATCH | /fines/{id}/pay | Librarian | Mark a fine as paid |

Status codes used: 200, 201, 204, 401, 403, 404, 422.

## React Pages

| Route | Access | Page |
|---|---|---|
| /login | Public | Login |
| /register | Public | Student registration |
| /dashboard | Logged in | Summary figures |
| /books | Logged in | Book list with search, category filter, pagination; students get a Request button |
| /borrowings | Logged in | Students: own requests. Librarian: all requests with approve, return and mark fine paid |
| /manage/books | Librarian | Add, edit and delete books |
| /manage/categories | Librarian | Add, edit and delete categories |

## Known Limitations and Phase 2 Ideas

- No email or SMS reminders for due dates
- No book cover uploads
- No PDF export of reports
- No online payment of fines
- No reservations or waiting list
- No barcode scanning

## References

- Laravel, Laravel Sanctum, React, React Router and Axios official documentation.
- Claude (AI assistant by Anthropic) was used for guidance and code suggestions while building the API and the React pages. I reviewed, tested and adjusted the code myself.
