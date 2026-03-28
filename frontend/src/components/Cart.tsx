import type { CartItem } from '../types';

interface CartProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  continueShopping: () => void;
}

function Cart({ cart, setCart, continueShopping }: CartProps) {
  const total = cart.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );

  // Update a book's quantity in the cart; remove it if quantity drops to 0.
  function updateQuantity(bookID: number, quantity: number) {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.book.bookID !== bookID));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.book.bookID === bookID ? { ...item, quantity } : item
        )
      );
    }
  }

  return (
    <div className="container my-4">
      <h1 className="mb-4">Shopping Cart</h1>

      {cart.length === 0 ? (
        <p className="text-muted">Your cart is empty.</p>
      ) : (
        <table className="table table-striped table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Title</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => (
              <tr key={item.book.bookID}>
                <td>{item.book.title}</td>
                <td>${item.book.price.toFixed(2)}</td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    style={{ width: '80px' }}
                    value={item.quantity}
                    min={0}
                    onChange={(e) =>
                      updateQuantity(item.book.bookID, Number(e.target.value))
                    }
                  />
                </td>
                <td>${(item.book.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="text-end fw-bold">
                Total:
              </td>
              <td className="fw-bold">${total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      )}

      <button className="btn btn-primary" onClick={continueShopping}>
        &larr; Continue Shopping
      </button>
    </div>
  );
}

export default Cart;
