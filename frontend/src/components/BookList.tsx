import { useEffect, useState } from 'react';

// TypeScript interface describing the shape of a single book from the API.
// Property names match what the API returns (camelCase).
interface Book {
  bookID: number;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  classification: string;
  category: string;
  pageCount: number;
  price: number;
}

// TypeScript interface describing the full API response shape.
interface BooksResponse {
  books: Book[];
  totalCount: number;
}

// Base URL for all API calls. Defined once here so it's easy to update.
const API_BASE = 'https://localhost:7023';

function BookList() {
  // books: the current page of books returned from the API.
  const [books, setBooks] = useState<Book[]>([]);
  // totalCount: total number of books in the database (used to calculate pages).
  const [totalCount, setTotalCount] = useState(0);
  // page: which page we're currently on.
  const [page, setPage] = useState(1);
  // pageSize: how many books to show per page.
  const [pageSize, setPageSize] = useState(5);
  // sortAscending: true = A→Z, false = Z→A.
  const [sortAscending, setSortAscending] = useState(true);

  // Derived value: total number of pages based on count and page size.
  const totalPages = Math.ceil(totalCount / pageSize);

  // useEffect runs the fetch whenever page, pageSize, or sortAscending changes.
  // The dependency array [page, pageSize, sortAscending] controls when it re-runs.
  useEffect(() => {
    // Build the query string from the current state values.
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortAscending: String(sortAscending),
    });

    // Fetch books from the API and update state with the response.
    fetch(`${API_BASE}/api/books?${params}`)
      .then((res) => res.json())
      .then((data: BooksResponse) => {
        setBooks(data.books);
        setTotalCount(data.totalCount);
      });
  }, [page, pageSize, sortAscending]);

  // When the user changes the results-per-page dropdown, update pageSize
  // and reset to page 1 so we don't land on a page that no longer exists.
  function handlePageSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPageSize(Number(e.target.value));
    setPage(1);
  }

  // Toggle sort direction when the Title column header is clicked.
  // Also resets to page 1 since the order of results has changed.
  function toggleSort() {
    setSortAscending((prev) => !prev);
    setPage(1);
  }

  return (
    <div className="container my-4">
      <h1 className="mb-4">Bookstore</h1>

      {/* Results-per-page dropdown and total book count */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <label htmlFor="pageSizeSelect" className="form-label mb-0">
          Results per page:
        </label>
        <select
          id="pageSizeSelect"
          className="form-select w-auto"
          value={pageSize}
          onChange={handlePageSizeChange}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
        </select>
        <span className="ms-auto text-muted">
          {totalCount} books total
        </span>
      </div>

      {/* Books table — Bootstrap classes handle the striped/bordered styling */}
      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            {/* Clicking the Title header calls toggleSort to flip sort direction.
                The arrow indicator shows the current sort direction. */}
            <th
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={toggleSort}
            >
              Title {sortAscending ? '▲' : '▼'}
            </th>
            <th>Author</th>
            <th>Publisher</th>
            <th>ISBN</th>
            <th>Classification</th>
            <th>Category</th>
            <th>Pages</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {/* Render one row per book. key={book.bookID} helps React track rows efficiently. */}
          {books.map((book) => (
            <tr key={book.bookID}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.publisher}</td>
              <td>{book.isbn}</td>
              <td>{book.classification}</td>
              <td>{book.category}</td>
              <td>{book.pageCount}</td>
              <td>${book.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <nav>
        <ul className="pagination justify-content-center">
          {/* Previous button — disabled when already on page 1 */}
          <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
          </li>

          {/* Generate a numbered button for each page */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
              <button className="page-link" onClick={() => setPage(p)}>
                {p}
              </button>
            </li>
          ))}

          {/* Next button — disabled when already on the last page */}
          <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default BookList;
