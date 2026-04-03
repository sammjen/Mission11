import { useEffect, useState } from 'react';
import type { Book } from '../types';

const API = 'http://localhost:5206/api/books';

// Empty book template used when opening the "Add" form.
const emptyBook: Omit<Book, 'bookID'> = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 0,
  price: 0,
};

function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Omit<Book, 'bookID'>>(emptyBook);

  useEffect(() => {
    fetchAllBooks();
  }, []);

  // Fetches all books (no pagination — admin sees everything).
  async function fetchAllBooks() {
    const res = await fetch(`${API}?pageSize=1000`);
    const data = await res.json();
    setBooks(data.books);
  }

  function openAddForm() {
    setIsAdding(true);
    setEditingBook(null);
    setFormData(emptyBook);
  }

  function openEditForm(book: Book) {
    setEditingBook(book);
    setIsAdding(false);
    const { bookID, ...rest } = book;
    void bookID;
    setFormData(rest);
  }

  function cancelForm() {
    setIsAdding(false);
    setEditingBook(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'pageCount' || name === 'price' ? Number(value) : value,
    }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setIsAdding(false);
    fetchAllBooks();
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBook) return;
    await fetch(`${API}/${editingBook.bookID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, bookID: editingBook.bookID }),
    });
    setEditingBook(null);
    fetchAllBooks();
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this book?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    fetchAllBooks();
  }

  const showForm = isAdding || editingBook !== null;

  return (
    <div className="container mt-4">
      <h2>Admin — Manage Books</h2>

      {!showForm && (
        <button className="btn btn-success mb-3" onClick={openAddForm}>
          + Add Book
        </button>
      )}

      {showForm && (
        <div className="card mb-4 p-3">
          <h5>{isAdding ? 'Add New Book' : 'Edit Book'}</h5>
          <form onSubmit={isAdding ? handleAdd : handleUpdate}>
            <div className="row g-2">
              {(
                [
                  ['title', 'Title'],
                  ['author', 'Author'],
                  ['publisher', 'Publisher'],
                  ['isbn', 'ISBN'],
                  ['classification', 'Classification'],
                  ['category', 'Category'],
                  ['pageCount', 'Page Count'],
                  ['price', 'Price'],
                ] as [keyof typeof formData, string][]
              ).map(([field, label]) => (
                <div className="col-md-3" key={field}>
                  <label className="form-label">{label}</label>
                  <input
                    className="form-control"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required
                    type={
                      field === 'pageCount' || field === 'price'
                        ? 'number'
                        : 'text'
                    }
                    step={field === 'price' ? '0.01' : undefined}
                    min={
                      field === 'pageCount' || field === 'price'
                        ? '0'
                        : undefined
                    }
                  />
                </div>
              ))}
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-primary me-2">
                {isAdding ? 'Add' : 'Save'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Category</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.bookID}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.category}</td>
              <td>${book.price.toFixed(2)}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => openEditForm(book)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(book.bookID)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminBooks;
