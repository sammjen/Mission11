import { useEffect, useState } from 'react';
import type { Book, CartItem } from '../types';

interface BookListProps {
  cart: CartItem[];
  addToCart: (book: Book, currentPage: number) => void;
  goToCart: () => void;
  // The page to start on — set to whatever page the user was on when they last went to the cart.
  initialPage: number;
}

interface BooksResponse {
  books: Book[];
  totalCount: number;
}

const API_BASE = 'https://bookstore-api-samjenson-dmaxcea0c3hbfcde.centralus-01.azurewebsites.net';

function BookList({ cart, addToCart, goToCart, initialPage }: BookListProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(5);
  const [sortAscending, setSortAscending] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const totalPages = Math.ceil(totalCount / pageSize);

  // Derived cart summary values for the cart summary card.
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

  // Fetch the list of distinct categories once on mount.
  useEffect(() => {
    fetch(`${API_BASE}/api/books/categories`)
      .then((res) => res.json())
      .then((data: string[]) => setCategories(data));
  }, []);

  // Fetch books whenever page, pageSize, sortAscending, or selectedCategory changes.
  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortAscending: String(sortAscending),
    });
    if (selectedCategory) {
      params.append('category', selectedCategory);
    }

    fetch(`${API_BASE}/api/books?${params}`)
      .then((res) => res.json())
      .then((data: BooksResponse) => {
        setBooks(data.books);
        setTotalCount(data.totalCount);
      });
  }, [page, pageSize, sortAscending, selectedCategory]);

  function handlePageSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPageSize(Number(e.target.value));
    setPage(1);
  }

  function toggleSort() {
    setSortAscending((prev) => !prev);
    setPage(1);
  }

  // When the category filter changes, reset to page 1 so we don't land on a non-existent page.
  function handleCategoryChange(category: string) {
    setSelectedCategory(category);
    setPage(1);
  }

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="navbar navbar-dark bg-dark px-4 mb-4">
        <span className="navbar-brand fs-4 fw-semibold">📚 Bookstore</span>

        {/*
          Bootstrap Card — new Bootstrap feature #1.
          Displays the cart summary in a styled card inside the navbar.
        */}
        <div
          className="card bg-secondary border-0 text-white shadow-sm"
          style={{ cursor: 'pointer' }}
          onClick={goToCart}
        >
          <div className="card-body py-2 px-3">
            <div className="d-flex align-items-center gap-2">
              <span className="fw-semibold">Cart</span>
              {/*
                Bootstrap Badge — new Bootstrap feature #2.
                Shows the live cart item count next to the Cart label.
              */}
              <span className="badge bg-primary rounded-pill">
                {totalCartItems}
              </span>
              {totalCartItems > 0 && (
                <span className="text-white-50 small ms-1">
                  ${cartTotal.toFixed(2)}
                </span>
              )}
            </div>
            <p className="mb-0 text-white-50 small">
              {totalCartItems === 0
                ? 'Your cart is empty'
                : `${totalCartItems} item${totalCartItems !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-4">
      {/* ── Main content: category sidebar + books table ── */}
      <div className="row">
        {/* Category filter sidebar — Bootstrap col for the grid layout */}
        <div className="col-md-3 mb-4">
          <h5>Categories</h5>
          <ul className="list-group">
            <li
              className={`list-group-item list-group-item-action ${!selectedCategory ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleCategoryChange('')}
            >
              All Categories
            </li>
            {categories.map((cat) => (
              <li
                key={cat}
                className={`list-group-item list-group-item-action ${selectedCategory === cat ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>
        </div>

        {/* Books table + controls — takes up the remaining columns */}
        <div className="col-md-9">
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
              {totalCount} book{totalCount !== 1 ? 's' : ''}
              {selectedCategory ? ` in "${selectedCategory}"` : ' total'}
            </span>
          </div>

          {/* Books table */}
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
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
                <th></th>
              </tr>
            </thead>
            <tbody>
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
                  <td>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => addToCart(book, page)}
                    >
                      Add to Cart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
          <nav>
            <ul className="pagination justify-content-center">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage((p) => p - 1)}>
                  Previous
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p)}>
                    {p}
                  </button>
                </li>
              ))}

              <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      </div>
    </>
  );
}

export default BookList;
