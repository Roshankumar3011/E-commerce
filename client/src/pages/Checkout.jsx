import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiMapPin, FiCreditCard, FiTruck, FiSmartphone, FiBox } from 'react-icons/fi';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [address, setAddress] = useState(
    user?.addresses?.find((a) => a.isDefault) || {
      fullName: user?.name || '', phone: user?.phone || '',
      addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
    }
  );

  const handleAddressChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const subtotal = cart.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
  const shipping = subtotal >= 499 ? 0 : 40;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.pincode) {
      return toast.error('Please fill all address fields');
    }
    try {
      setLoading(true);
      const res = await API.post('/orders', { shippingAddress: address, paymentMethod });
      const order = res.data.order;

      if (paymentMethod === 'PhonePe') {
        const payRes = await API.post('/payment/create-order', { amount: total, orderId: order._id });
        if (payRes.data.url) {
           // Redirect to PhonePe gateway (or mock success URL)
           window.location.href = payRes.data.url;
           return;
        }
      }

      toast.success('Order placed successfully!');
      navigate(`/order/${order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page animate-fadeIn">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-layout">
          <div className="checkout-forms">
            {/* Delivery Address */}
            <div className="checkout-section card">
              <h2><FiMapPin size={16} /> Delivery Address</h2>
              {user?.addresses?.length > 0 && (
                <div className="saved-addresses">
                  <p className="saved-label">Saved Addresses:</p>
                  {user.addresses.map((addr) => (
                    <button key={addr._id} className={`saved-addr-btn ${address.pincode === addr.pincode && address.addressLine1 === addr.addressLine1 ? 'active' : ''}`} onClick={() => setAddress(addr)}>
                      <strong>{addr.fullName}</strong> — {addr.addressLine1}, {addr.city} - {addr.pincode}
                    </button>
                  ))}
                </div>
              )}
              <div className="address-grid">
                <div className="input-group"><label>Full Name *</label><input name="fullName" value={address.fullName} onChange={handleAddressChange} /></div>
                <div className="input-group"><label>Phone *</label><input name="phone" value={address.phone} onChange={handleAddressChange} /></div>
                <div className="input-group full"><label>Address Line 1 *</label><input name="addressLine1" value={address.addressLine1} onChange={handleAddressChange} /></div>
                <div className="input-group full"><label>Address Line 2</label><input name="addressLine2" value={address.addressLine2 || ''} onChange={handleAddressChange} /></div>
                <div className="input-group"><label>City *</label><input name="city" value={address.city} onChange={handleAddressChange} /></div>
                <div className="input-group"><label>State *</label><input name="state" value={address.state} onChange={handleAddressChange} /></div>
                <div className="input-group"><label>Pincode *</label><input name="pincode" value={address.pincode} onChange={handleAddressChange} /></div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-section card">
              <h2><FiCreditCard size={16} /> Payment Method</h2>
              <div className="payment-options">
                {[
                  { value: 'COD', label: 'Cash on Delivery', icon: <FiTruck size={15} /> },
                  { value: 'PhonePe', label: 'Online Payment (PhonePe)', icon: <FiSmartphone size={15} /> },
                  { value: 'Dummy', label: 'Dummy Payment (Test)', icon: <FiBox size={15} /> },
                ].map((opt) => (
                  <label key={opt.value} className={`payment-option ${paymentMethod === opt.value ? 'active' : ''}`}>
                    <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span className="payment-icon">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary card">
            <h3>Order Summary</h3>
            <div className="checkout-items">
              {cart.items.map((item) => (
                <div key={item._id} className="checkout-item">
                  <img src={item.product?.images?.[0]} alt="" />
                  <div>
                    <p>{item.product?.name}</p>
                    <span>{item.size} · Qty: {item.quantity}</span>
                    <strong>₹{(item.price * item.quantity).toLocaleString()}</strong>
                  </div>
                </div>
              ))}
            </div>
            <div className="summary-rows">
              <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div className="summary-row"><span>Shipping</span><span className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              <div className="summary-row total"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
            </div>
            <button className="btn btn-secondary btn-lg btn-block" onClick={handlePlaceOrder} disabled={loading}>
              {loading ? 'Placing Order...' : `Place Order — ₹${total.toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
