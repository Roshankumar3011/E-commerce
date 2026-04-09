import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { getProductImage } from '../utils/assets';
import './Cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container">
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <div className="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            <FiShoppingBag /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalOriginal = cart.items.reduce((sum, item) => {
    const orig = item.product?.originalPrice || item.price;
    return sum + (orig * item.quantity);
  }, 0);
  const discount = totalOriginal - subtotal;
  const shipping = subtotal >= 499 ? 0 : 40;
  const total = subtotal + shipping;

  return (
    <div className="cart-page animate-fadeIn">
      <div className="container">
        <h1 className="cart-title">Shopping Cart ({cart.items.length} items)</h1>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item._id} className="cart-item card">
                <Link to={`/product/${item.product?._id}`} className="cart-item-img">
                  <img src={getProductImage(item.product?.images?.[0], 'https://via.placeholder.com/120')} alt={item.product?.name} />
                </Link>


                <div className="cart-item-details">
                  <Link to={`/product/${item.product?._id}`}>
                    <h3>{item.product?.name || 'Product'}</h3>
                  </Link>
                  <div className="cart-item-meta">
                    <span>Size: <strong>{item.size}</strong></span>
                    {item.color?.name && <span>Color: <strong>{item.color.name}</strong></span>}
                  </div>

                  <div className="cart-item-pricing">
                    <span className="cart-price">₹{item.price?.toLocaleString()}</span>
                    {item.product?.originalPrice > item.price && (
                      <>
                        <span className="cart-original">₹{item.product.originalPrice?.toLocaleString()}</span>
                        <span className="cart-off">{item.product?.discount || Math.round(((item.product.originalPrice - item.price) / item.product.originalPrice) * 100)}% off</span>
                      </>
                    )}
                  </div>

                  <div className="cart-item-actions">
                    <div className="qty-control">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1}>
                        <FiMinus />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                        <FiPlus />
                      </button>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item._id)}>
                      <FiTrash2 /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="cart-summary card">
            <h3>Price Details</h3>
            <div className="summary-rows">
              <div className="summary-row">
                <span>Price ({cart.items.length} items)</span>
                <span>₹{totalOriginal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>−₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Delivery Charges</span>
                <span className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            {discount > 0 && (
              <p className="savings-text">You will save ₹{discount.toLocaleString()} on this order</p>
            )}

            <button className="btn btn-secondary btn-lg btn-block" onClick={() => navigate('/checkout')}>
              Place Order <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
