import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiCheckCircle, FiChevronRight, FiArrowLeft, FiShare2, 
  FiSmartphone, FiHome, FiMapPin, FiTruck, FiBox, FiGift
} from 'react-icons/fi';
import API from '../utils/api';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get(`/orders/${id}`);
        setOrder(res.data.order);

        const prodRes = await API.get('/products');
        const prods = prodRes.data.products || [];
        // Shuffle array for slightly random recommendations
        const shuffled = [...prods].sort(() => 0.5 - Math.random());
        setSuggestions(shuffled.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch order or suggestions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div className="loading-success">Placing your order...</div>;

  const deliveryDate = "Thu, Apr 23rd '26"; // Mock dynamic date from screenshot

  return (
    <div className="order-success-page animate-fadeIn">
      {/* Header */}
      <div className="success-header">
        <button className="back-btn" onClick={() => navigate('/')}><FiArrowLeft /></button>
        <h1>Order Placed</h1>
      </div>

      <div className="success-content container">
        {/* Confirmed Banner */}
        <div className="confirmed-card card">
          <div className="conf-main">
            <div className="conf-text">
              <h2>Thanks for shopping with us!</h2>
              {order?.paymentMethod === 'COD' && (
                <div className="cod-notice" style={{ background: '#f0faff', color: '#2874f0', padding: '8px 12px', borderRadius: '4px', margin: '10px 0', fontSize: '14px', fontWeight: '500' }}>
                  <FiTruck style={{ marginRight: '8px' }} />
                  Cash on Delivery: Pay ₹{order.totalAmount?.toLocaleString()} in cash
                </div>
              )}
              <p className="deliv-time">Delivery by {deliveryDate}</p>
              <Link to="/orders" className="track-link">Track & manage order</Link>
            </div>
            <div className="conf-icon-wrapper">
              <div className="conf-circle">
                <FiCheckCircle />
              </div>
              <div className="sparkle s1"></div>
              <div className="sparkle s2"></div>
            </div>
          </div>
        </div>


        {/* Delivery Details */}
        <div className="details-section">
          <h3>Delivery details</h3>
          <div className="delivery-details-card card">
            <div className="deliv-row">
              <FiHome className="icon" />
              <div className="text">
                <span className="label">Home</span>
                <p>{order?.shippingAddress?.addressLine1}, {order?.shippingAddress?.city}</p>
              </div>
              <FiChevronRight className="chevron" />
            </div>
            <div className="deliv-row">
              <FiMapPin className="icon" />
              <div className="text">
                <span className="label">{order?.shippingAddress?.fullName}</span>
                <p>{order?.shippingAddress?.phone}</p>
              </div>
              <FiChevronRight className="chevron" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="success-actions">
          <button className="btn btn-primary continue-shop-btn" onClick={() => navigate('/')}>
            Continue Shopping
          </button>

          <div className="orders-direct-card card">
            <div className="direct-header">
               <div className="app-icon"><FiBox /></div>
               <div className="direct-text">
                  <h4>Why call? Just click!</h4>
                  <button onClick={() => navigate('/orders')}>Go to My Orders</button>
               </div>
            </div>
          </div>
        </div>

        {/* Real Product Recommendations */}
        {suggestions.length > 0 && (
          <div className="suggestions-section">
             <h3>You might be also interested in</h3>
             <div className="suggest-scroll">
                {suggestions.map((product) => (
                  <Link to={`/product/${product._id}`} key={product._id} className="suggest-card card" style={{ textDecoration: 'none', color: 'inherit' }}>
                     <div className="suggest-img">
                       <img src={product.images?.[0] || 'https://via.placeholder.com/200'} alt={product.name} />
                     </div>
                     <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 8px' }}>{product.name}</p>
                     <strong>₹{product.price?.toLocaleString()}</strong>
                  </Link>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccess;
