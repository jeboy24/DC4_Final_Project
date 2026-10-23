# BookLend: School Library Borrowing System

BookLend moves the MDC library from a paper logbook to online borrowing, built for the librarian and the students.

## 1. The client and the problem

| | |
|---|---|
| *Client* | School Library Office, MDC |
| *Problem today* | Borrowing is tracked in a paper logbook. Staff cannot quickly see which books are available, overdue or unpaid. Students do not know if a book is in until they visit the shelf. Late fines are computed by hand, which leads to disputes and lost records. |
| *Goal* | One web system where students search and request books, and the librarian manages the collection, approves loans, records returns and tracks fines. |

## 2. User roles

| Role | What they can do |
|---|---|
| *Guest* | Register and log in |
| *Student* | Browse and search books, request a book, cancel a request while it is still Requested, view own borrowings and fines, see a personal dashboard |
| *Librarian* (admin, 1 seeded) | Dashboard with library-wide figures, full CRUD on books and categories, approve requests, mark books returned, view all borrowings and fines, mark fines paid |

Anyone who registers becomes a student. Librarian-only pages are hidden in React and blocked by Laravel middleware.

### Permissions

| Feature | Librarian | Student |
|---|---|---|
| Register account | No (seeded account) | Yes |
| Login / logout | Yes | Yes |
| View dashboard | Library-wide | Own figures |
| View and search books | Yes | Yes |
| Manage books and categories (CRUD) | Yes | View only |
| Request a book | No | Yes |
| View borrowings | All records | Own only |
| Cancel a request | Yes | Own, only while Requested |
| Approve a request | Yes | No |
| Mark a book returned | Yes | No |
| View fines | All fines | Own fines |
| Mark a fine paid | Yes | No |

## 3. Objectives

| | |
|---|---|
| *General* | Develop a web-based system that helps the school library manage its books and student borrowing efficiently. |
| *Specific* | Secure login and registration with Laravel Sanctum tokens<br>Librarian can add, view, update, search and delete books and categories<br>Students can register, browse, search and request books, and follow their request status<br>Librarian can approve requests, record returns and mark fines as paid<br>Fines are computed automatically for late returns<br>Dashboard summarizes books, requests, loans and fines<br>Tested REST API (Thunder Client) with a React frontend, using Git and GitHub |

## 4. Status workflow

Statuses: *Requested → Borrowed → Returned*. A request only moves forward.

| From | To | Done by |
|---|---|---|
| (new request) | Requested | System (default when a student requests a book) |
| Requested | Borrowed | Librarian (borrowed date and due date are set, one copy is taken off the shelf) |
| Borrowed | Returned | Librarian (the copy is put back; a fine is created if the book is late) |
| Requested | Cancelled (record removed) | Student or librarian |

### Rules

- Returned is final and cannot be changed.
- A student can cancel a request only while it is Requested.
- The loan period is *7 days* from the borrowed date.
- A late book gets a fine of *5 pesos per late day*.
- A student cannot request a book with no copies available, or one they already have requested or borrowed.
- The API rejects invalid transitions with a 422 response.

##
