BookLend: School Library Borrowing System
1. BookLend
BookLend moves the MDC library from a paper logbook to online borrowing, built for the librarian and the students.
2. Client
School Library Office, MDC
The office looks after the school's book collection and handles student borrowing, returns and late-return fines.
3. Problem Statement
The library currently tracks borrowing in a paper logbook. This causes several problems:
•Staff cannot quickly see which books are available, overdue or unpaid.
•Students do not know whether a book is in until they visit the shelf.
•Finding who holds a book and when it is due means searching the logbook by hand.
•Late fines are computed by hand, which leads to disputes and lost records.
•Counting how many books were borrowed or returned takes too much manual work.
The library needs one simple web system where students can search and request books, and the librarian can manage the collection, approve loans, record returns and track fines.
4. Objectives
General objective: develop a web-based system that helps the school library manage its books and student borrowing efficiently.
Specific objectives:
1.Provide secure login and registration using Laravel Sanctum token authentication.
2.Allow the librarian to add, view, update, search and delete books and categories.
3.Allow students to register, browse and search the book list.
4.Allow students to request a book and follow the status of their request.
5.Allow the librarian to approve requests, record returns and mark fines as paid.
6.Compute a fine automatically when a book is returned after its due date.
7.Provide a dashboard that summarizes books, requests, loans and fines.
8.Build a tested REST API (Thunder Client) with a React frontend, using Git and GitHub for version control.
5. User Roles and Permissions
The system has two roles, stored in the role column of the users table (admin or student). The librarian is treated as the single admin role to keep the project simple.
Feature	Librarian (admin)	Student
Register account	No (seeded account)	Yes
Login / logout	Yes	Yes
View dashboard	Yes (library-wide figures)	Yes (own figures)
View and search books	Yes	Yes
Manage books (CRUD)	Yes	No (view only)
Manage categories (CRUD)	Yes	No (view only)
Request a book	No	Yes
View borrowings	All records	Own records only
Cancel a request	Yes	Own, only while Requested
Approve a request	Yes	No
Mark a book returned	Yes	No
View fines	All fines	Own fines only
Mark a fine paid	Yes	No
Anyone who registers becomes a student. Librarian-only pages are hidden in React and blocked by Laravel middleware.
6. Main Entities
users
Field	Type	Notes
id	bigint, PK	
name	string	
email	string	unique
password	string	hashed
role	enum: admin, student	default student
timestamps		
categories
Field	Type	Notes
id	bigint, PK	
name	string	unique (e.g., Fiction, Science, Filipiana)
timestamps		
books
Field	Type	Notes
id	bigint, PK	
category_id	FK to categories	deleted with its category
title	string	
author	string	
isbn	string	unique
copies_available	unsigned integer	default 1
timestamps		
borrow_records
Field	Type	Notes
id	bigint, PK	
user_id	FK to users	the student who requested the book
book_id	FK to books	
status	enum: requested, borrowed, returned	default requested
borrowed_at	date	nullable, set on approval
due_date	date	nullable, 7 days after borrowing
returned_at	date	nullable
timestamps		
fines
Field	Type	Notes
id	bigint, PK	
borrow_record_id	FK to borrow_records	one fine per late return
amount	decimal(8,2)	days late x 5 pesos
is_paid	boolean	default false
timestamps		
Relationships
•A category has many books.
•A book belongs to a category and has many borrow records.
•A user has many borrow records.
•A borrow record belongs to a user and a book, and has at most one fine.
•A fine belongs to a borrow record.
7. Planned Features
Authentication
•Register (students only), login and logout with Laravel Sanctum tokens
•Role-based route protection in both the API (middleware) and React (protected routes)
Librarian (admin)
•Dashboard with total books, categories, pending requests, currently borrowed, overdue, returned this week and unpaid fines
•Book management: add, view, edit and delete
•Category management: add, view, edit and delete
•Borrowing management: approve requests, mark books returned, cancel pending requests
•Fine management: view fines and mark them paid
•Search and filter: books by title, author, ISBN or category; borrowings by status, book or student name
Student
•Register and login
•Browse and search books, and filter by category
•Request a book that has copies available
•View own borrowings with their status, due date and fines
•Cancel a request while it is still Requested
•Dashboard with own pending requests, loans, overdue books and unpaid fines
General
•Form validation (Laravel Form Requests and frontend checks), with errors shown under the fields
•Pagination on list pages
•Loading indicators, success and error messages, and a confirm step before deleting
•Responsive layout
Out of scope: email or SMS notifications, book cover uploads, PDF export, online fine payment, reservations and barcode scanning. These can be future enhancements.
8. CRUD Resources
Resource	Create	Read	Update	Delete	Who
Books	Yes	Yes	Yes	Yes	Librarian full access; all logged-in users can read
Categories	Yes	Yes	Yes	Yes	Librarian full access; all logged-in users can read
Borrow records	Yes (student requests a book)	Yes	Yes (status, by the librarian)	Yes (cancel while Requested)	Students create and read their own; librarian manages all
Fines	Automatic on late return	Yes	Yes (mark paid)	No	Librarian updates; students read their own
Users	Register only	Own account	No	No	Created through registration
The two main CRUD resources are books and categories, where one category has many books. Borrow records and fines carry the status workflow.
9. Status Workflow
Statuses: Requested, Borrowed, Returned. A request moves forward only, from Requested to Borrowed to Returned.
From	To	Done by
(new request)	Requested	System (default when a student requests a book)
Requested	Borrowed	Librarian (borrowed date and due date are set, one copy is taken off the shelf)
Borrowed	Returned	Librarian (the copy is put back; a fine is created if the book is late)
Requested	Cancelled (record removed)	Student or librarian
Rules
•Returned is a final status and cannot be changed.
•A student can cancel a request only while it is Requested.
•The loan period is 7 days from the borrowed date.
•A book returned after its due date gets a fine of 5 pesos for each late day.
•A student cannot request a book with no copies available, or one they already have requested or borrowed.
•The API rejects invalid transitions with a 422 response.
10. Technology Stack
Layer	Technology
Frontend	React with Vite
Routing	React Router
HTTP client	Axios
State	Context API (authentication)
Styling	Plain responsive CSS
Backend	Laravel (REST API)
Language	PHP
Authentication	Laravel Sanctum (token-based)
Database	MySQL
Version control	Git and GitHub
API testing	Thunder Client
Project structure: two folders in one repository, backend/ (Laravel API) and frontend/ (React + Vite). The frontend stores the Sanctum token in the browser and sends it through an Axios interceptor on every request. A 401 response clears the token and returns the user to the login page.
11. Proposed React Pages
Public pages
Route	Page
/login	Login
/register	Student registration
Pages for any logged-in user
Route	Page
/dashboard	Summary figures (library-wide for the librarian, personal for a student)
/books	Book list with search, category filter and pagination; students get a Request button
/borrowings	Students: own requests with status filter and cancel while Requested. Librarian: all requests with approve, mark returned and mark fine paid
Librarian pages
Route	Page
/manage/books	Add, edit and delete books in a modal form
/manage/categories	Add, edit and delete categories
Other
Route	Page
*	Any unknown address redirects to the dashboard
Shared components
Navbar with role-based links, ProtectedRoute (checks login and role), FormInput, Button, Modal and Pagination.
12. Proposed Laravel API Endpoints
All routes are prefixed with /api. Routes marked Auth require auth:sanctum; routes marked Librarian also require the admin middleware.
Authentication and dashboard
Method	Endpoint	Access	Description
POST	/register	Public	Register a student and return a token
POST	/login	Public	Log in and return a token
POST	/logout	Auth	Revoke the current token
GET	/user	Auth	Get the logged-in user
GET	/dashboard	Auth	Summary figures for the user's role
Categories
Method	Endpoint	Access	Description
GET	/categories	Auth	List with search and pagination (all=1 returns every category for dropdowns)
GET	/categories/{id}	Auth	View one category
POST	/categories	Librarian	Create a category
PUT	/categories/{id}	Librarian	Update a category
DELETE	/categories/{id}	Librarian	Delete a category
Books
Method	Endpoint	Access	Description
GET	/books	Auth	List with search, category_id and pagination
GET	/books/{id}	Auth	View one book
POST	/books	Librarian	Create a book
PUT	/books/{id}	Librarian	Update a book
DELETE	/books/{id}	Librarian	Delete a book
Borrow records
Method	Endpoint	Access	Description
GET	/borrow-records	Auth	Own records for a student, all records for the librarian; status and search filters, paginated
POST	/borrow-records	Auth	Request a book (book_id)
GET	/borrow-records/{id}	Auth	View one record (students: own only)
DELETE	/borrow-records/{id}	Auth	Cancel a request while it is still Requested
PATCH	/borrow-records/{id}/status	Librarian	Move Requested to Borrowed, or Borrowed to Returned
Fines
Method	Endpoint	Access	Description
GET	/fines	Auth	Own fines for a student, all fines for the librarian; is_paid filter, paginated
PATCH	/fines/{id}/pay	Librarian	Mark a fine as paid
