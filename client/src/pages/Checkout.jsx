import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  FiMapPin, FiCreditCard, FiTruck, FiSmartphone, FiBox, 
  FiChevronLeft, FiCheck, FiChevronRight, FiShield, FiHeart
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Address, 2: Summary, 3: Payment
  
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [expandedPayment, setExpandedPayment] = useState('UPI');
  
  const [address, setAddress] = useState(
    user?.addresses?.find((a) => a.isDefault) || {
      fullName: user?.name || '', phone: user?.phone || '',
      addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
    }
  );

  const handleAddressChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const subtotal = cart.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
  const originalTotal = cart.items?.reduce((s, i) => s + (i.product?.originalPrice || i.price) * i.quantity, 0) || 0;
  const discount = originalTotal - subtotal;
  const shipping = subtotal >= 499 ? 0 : 40;
  const total = subtotal + shipping;

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.pincode) {
        return toast.error('Please fill all address fields');
      }
    }
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const handlePrevStep = () => {
    if (currentStep === 1) navigate('/cart');
    else setCurrentStep(prev => prev - 1);
  };

  const handleFinishOrder = async () => {
    try {
      setLoading(true);
      
      // 1. Create order in our DB (Status: Pending)
      const res = await API.post('/orders', { 
        shippingAddress: address, 
        paymentMethod,
        totalAmount: total
      });
      
      if (!res.data.success || !res.data.order) {
        throw new Error('Failed to initiate order in system');
      }

      const order = res.data.order;

      // 2. Handle COD (No Razorpay needed)
      if (paymentMethod === 'COD') {
        toast.success('Order placed successfully (COD)!');
        clearCart();
        navigate(`/order-success/${order._id}`);
        return;
      }

      // 3. Initiate Razorpay Checkout
      const { data: rzpOrder } = await API.post('/payment/razorpay/create-order', {
        amount: total,
        orderId: order._id
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_zH4XfSAt8r0K33', // Fallback to test key
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'Balajee Store',
        description: 'Payment for Order #' + order._id.slice(-6),
        image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=100',
        order_id: rzpOrder.id,
        handler: async (response) => {
          try {
            setLoading(true);
            const verifyRes = await API.post('/payment/razorpay/verify', {
              ...response,
              orderId: order._id
            });
            
            if (verifyRes.data.success) {
              toast.success('Payment successful!');
              clearCart();
              navigate(`/order-success/${order._id}`);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            toast.error('Verification Error: ' + (err.response?.data?.message || err.message));
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: address.fullName,
          contact: address.phone,
          email: user?.email || '',
        },
        theme: {
          color: '#2874f0',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast('Payment cancelled. You can try again from your orders.', { icon: 'ℹ️' });
          }
        }
      };

      if (!window.Razorpay) {
        toast.error('Razorpay SDK failed to load. Please check your internet.');
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Checkout Error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to process order');
      setLoading(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    useEffect(() => {
      navigate('/cart');
    }, []);
    return null;
  }

  return (
    <div className="checkout-page-v2 animate-fadeIn">
      {/* Sticky Header */}
      <div className="checkout-sticky-header">
        <div className="container header-content">
          <button className="back-btn" onClick={handlePrevStep}>
            <FiChevronLeft />
          </button>
          <div className="header-title">
            <span className="step-count">Step {currentStep} of 3</span>
            <h1>{currentStep === 1 ? 'Delivery Address' : currentStep === 2 ? 'Order Summary' : 'Payments'}</h1>
          </div>
          <div className="secure-badge">
            <FiShield /> 100% Secure
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div className="progress-steps-wrapper container">
            <div className={`progress-step-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <div className="step-circle">{currentStep > 1 ? <FiCheck /> : '1'}</div>
              <span>Address</span>
            </div>
            <div className={`progress-line ${currentStep > 1 ? 'completed' : ''}`}></div>
            <div className={`progress-step-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-circle">{currentStep > 2 ? <FiCheck /> : '2'}</div>
              <span>Order Summary</span>
            </div>
            <div className={`progress-line ${currentStep > 2 ? 'completed' : ''}`}></div>
            <div className={`progress-step-item ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-circle">3</div>
              <span>Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container checkout-content-v2">
        <div className="checkout-main-col">
          
          {/* STEP 1: ADDRESS */}
          {currentStep === 1 && (
            <div className="checkout-section-v2 card animate-slideUp">
              <div className="section-head">
                <h2><FiMapPin /> Delivery Address</h2>
              </div>
              
              {user?.addresses?.length > 0 && (
                <div className="saved-addresses-v2">
                  <p className="label">Saved Addresses:</p>
                  <div className="addr-grid">
                    {user.addresses.map((addr) => (
                      <div key={addr._id} 
                        className={`addr-card ${address.addressLine1 === addr.addressLine1 ? 'active' : ''}`}
                        onClick={() => setAddress(addr)}
                      >
                        <div className="radio-circle"></div>
                        <div className="addr-info">
                          <span className="name">{addr.fullName} <span className="tag">{addr.isDefault ? 'HOME' : 'WORK'}</span></span>
                          <p>{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                          <span className="phone">{addr.phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="new-address-form">
                <p className="label">Add New Address:</p>
                <div className="form-grid">
                  <div className="input-field"><label>Full Name</label><input name="fullName" value={address.fullName} onChange={handleAddressChange} /></div>
                  <div className="input-field"><label>Phone Number</label><input name="phone" value={address.phone} onChange={handleAddressChange} /></div>
                  <div className="input-field full"><label>Address Line 1</label><input name="addressLine1" value={address.addressLine1} onChange={handleAddressChange} /></div>
                  <div className="input-field full"><label>Address Line 2 (Optional)</label><input name="addressLine2" value={address.addressLine2 || ''} onChange={handleAddressChange} /></div>
                  <div className="input-field"><label>City</label><input name="city" value={address.city} onChange={handleAddressChange} /></div>
                  <div className="input-field"><label>State</label><input name="state" value={address.state} onChange={handleAddressChange} /></div>
                  <div className="input-field"><label>Pincode</label><input name="pincode" value={address.pincode} onChange={handleAddressChange} /></div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SUMMARY */}
          {currentStep === 2 && (
            <div className="checkout-summary-v2 animate-slideUp">
              {/* Delivery Address Summary */}
              <div className="delivery-card card">
                <div className="card-head">
                  <span>Deliver to:</span>
                  <button className="change-btn" onClick={() => setCurrentStep(1)}>Change</button>
                </div>
                <div className="card-body">
                  <span className="name">{address.fullName} <span className="tag">HOME</span></span>
                  <p>{address.addressLine1}, {address.city}, {address.state} - {address.pincode}</p>
                  <span className="phone">{address.phone}</span>
                </div>
              </div>

              {/* Product List */}
              <div className="product-list-v2 card">
                <div className="hot-deal-badge">Hot Deal</div>
                {cart.items.map((item) => (
                  <div key={item._id} className="order-item-v2">
                    <div className="item-img"><img src={item.product?.images?.[0]} alt="" /></div>
                    <div className="item-details">
                      <h3>{item.product?.name}</h3>
                      <p className="item-variant">Size: {item.size}</p>
                      <div className="item-rating">
                        <span className="stars">★★★★★</span>
                        <span className="rating-val">4.5 · (120)</span>
                      </div>
                      <div className="item-pricing">
                        <span className="discount-pct">59% OFF</span>
                        <span className="original-price">₹{(item.product?.originalPrice || item.price * 2).toLocaleString()}</span>
                        <span className="final-price">₹{item.price.toLocaleString()}</span>
                      </div>
                      <div className="item-delivery">Delivery by Thu, Apr 23</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT */}
          {currentStep === 3 && (
            <div className="checkout-payment-v2 animate-slideUp">
              <div className="payment-offers card">
                <div className="offer-badge">5% Cashback</div>
                <p>Claim now with payment offers</p>
              </div>

              <div className="payment-methods-list card">
                <div className="section-title-p">CHOOSE PAYMENT METHOD</div>
                {[
                  // { id: 'UPI', label: 'UPI (GPay, PhonePe, BHIM)', icon: <FiSmartphone /> },
                  // { id: 'CARD', label: 'Credit / Debit / ATM Card', icon: <FiCreditCard /> },
                  { id: 'COD', label: 'Cash on Delivery', icon: <FiTruck /> },
                  // { id: 'NET', label: 'Net Banking', icon: <FiBox /> }
                ].map((method) => (
                  <div key={method.id} 
                    className={`pay-option-v2 ${paymentMethod === method.id ? 'active' : ''}`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div className="radio-circle"></div>
                    <div className="pay-content">
                      <div className="pay-label">{method.icon} <span>{method.label}</span></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="payment-trust-banner">
                <p>35 Crore happy customers and counting!</p>
                <div className="smile-icon">😊</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column / Summary (Hidden on Mobile Step 1/2) */}
        <div className="checkout-summary-col">
          <div className="price-details-card card">
            <h3>Price Details</h3>
            <div className="price-rows">
              <div className="price-row"><span>Price ({cart.items.length} items)</span><span>₹{originalTotal.toLocaleString()}</span></div>
              <div className="price-row discount"><span>Discount</span><span>−₹{discount.toLocaleString()}</span></div>
              <div className="price-row"><span>Delivery Charges</span><span className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              <div className="price-row total"><span>Total Amount</span><span>₹{total.toLocaleString()}</span></div>
            </div>

            {/* Desktop-only Continue Button */}
            <div className="desktop-continue-wrapper">
              <button className="desktop-continue-btn" onClick={currentStep === 3 ? handleFinishOrder : handleNextStep} disabled={loading}>
                {loading ? 'Processing...' : currentStep === 3 ? (paymentMethod === 'COD' ? 'PLACE ORDER (COD)' : `PAY ₹${total.toLocaleString()}`) : 'Continue'}
              </button>
            </div>

            <div className="savings-msg">
              <FiHeart /> You will save ₹{discount.toLocaleString()} on this order
            </div>
          </div>
          
          <div className="safe-payments-hint">
             <FiShield /> Safe and Secure Payments. Easy returns. 100% Authentic products.
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar (Mobile/Step 1 & 2) */}
      <div className="checkout-sticky-footer">
        <div className="container footer-content">
          <div className="footer-price">
            <span className="price-label">Total:</span>
            <div className="price-group">
              <span className="final">₹{total.toLocaleString()}</span>
              <span className="original">₹{originalTotal.toLocaleString()}</span>
            </div>
          </div>
          <button className="continue-btn" onClick={currentStep === 3 ? handleFinishOrder : handleNextStep} disabled={loading}>
            {loading ? '...' : currentStep === 3 ? (paymentMethod === 'COD' ? 'PLACE ORDER (COD)' : `PAY ₹${total.toLocaleString()}`) : 'Continue'}
          </button>
        </div>
        <div className="savings-badge">
           <FiCheck /> You'll save ₹{discount.toLocaleString()} on this order!
        </div>
      </div>
    </div>
  );
};

export default Checkout;

