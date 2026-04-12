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
      <div className="empty-page-container">
        <div className="empty-page-inner">
          <div className="empty-page-illustration">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="90" fill="#EFF6FF" />
              <rect x="55" y="65" width="90" height="75" rx="8" fill="#BFDBFE" />
              <rect x="65" y="55" width="70" height="10" rx="5" fill="#93C5FD" />
              <circle cx="78" cy="152" r="10" fill="#3B82F6" />
              <circle cx="122" cy="152" r="10" fill="#3B82F6" />
              <rect x="72" y="80" width="56" height="8" rx="4" fill="white" opacity="0.8"/>
              <rect x="72" y="96" width="40" height="8" rx="4" fill="white" opacity="0.6"/>
              <circle cx="158" cy="52" r="14" fill="#FEF3C7" />
              <text x="154" y="57" fontSize="14">✨</text>
            </svg>
          </div>
          <h2 className="empty-page-title">Your cart is empty</h2>
          <p className="empty-page-subtitle">Looks like you haven't added anything to your cart yet. Start exploring our collections!</p>
          <div className="empty-page-actions">
            <Link to="/products" className="empty-cta-primary">
              <FiShoppingBag /> Start Shopping
            </Link>
            <Link to="/products/Men" className="empty-cta-secondary">Browse Men's</Link>
            <Link to="/products/Women" className="empty-cta-secondary">Browse Women's</Link>
          </div>
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
