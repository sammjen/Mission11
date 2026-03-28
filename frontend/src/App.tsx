import { useState } from 'react';
import BookList from './components/BookList';
import Cart from './components/Cart';
import type { Book, CartItem } from './types';

function App() {
  // cart holds all items the user has added. It persists as long as the app is running.
  const [cart, setCart] = useState<CartItem[]>([]);

  // view controls which page is shown — the book list or the cart.
  const [view, setView] = useState<'booklist' | 'cart'>('booklist');

  // returnPage remembers which page the user was on when they added a book,
  // so "Continue Shopping" can bring them back to the right place.
  const [returnPage, setReturnPage] = useState(1);

  // Called when the user clicks "Add to Cart" on any book.
  // Saves the current page, updates the cart, then navigates to the cart view.
  function addToCart(book: Book, currentPage: number) {
    setReturnPage(currentPage);
    setCart((prev) => {
      const existing = prev.find((item) => item.book.bookID === book.bookID);
      if (existing) {
        // Book already in cart — just increment quantity.
        return prev.map((item) =>
          item.book.bookID === book.bookID
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // New book — add it with quantity 1.
      return [...prev, { book, quantity: 1 }];
    });
    setView('cart');
  }

  // Called by the Cart's "Continue Shopping" button — goes back to the book list.
  function continueShopping() {
    setView('booklist');
  }

  function goToCart() {
    setView('cart');
  }

  return (
    <>
      {view === 'booklist' ? (
        <BookList
          cart={cart}
          addToCart={addToCart}
          goToCart={goToCart}
          initialPage={returnPage}
        />
      ) : (
        <Cart
          cart={cart}
          setCart={setCart}
          continueShopping={continueShopping}
        />
      )}
    </>
  );
}

export default App;
