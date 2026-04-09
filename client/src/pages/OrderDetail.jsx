import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheck, FiTruck, FiPackage, FiMapPin } from 'react-icons/fi';
import API from '../utils/api';
import { getProductImage } from '../utils/assets';
import toast from 'react-hot-toast';
import './OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/orders/${id}`);
        setOrder(res.data.order);
      } catch (err) {
        toast.error('Order not found');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await API.put(`/orders/${id}/cancel`);
      toast.success('Order cancelled');
      const res = await API.get(`/orders/${id}`);
      setOrder(res.data.order);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (!order) return null;

  const steps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentStep = steps.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'Cancelled';

  return (
    <div className="order-detail-page animate-fadeIn">
      <div className="container">
        <h1>Order #{order.orderNumber}</h1>
        <p className="order-detail-date">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        {/* Status Tracker */}
        {!isCancelled ? (
          <div className="status-tracker card">
            <div className="tracker-steps">
              {steps.map((step, idx) => (
                <div key={step} className={`tracker-step ${idx <= currentStep ? 'completed' : ''} ${idx === currentStep ? 'current' : ''}`}>
                  <div className="step-circle">
                    {idx < currentStep ? <FiCheck /> : idx === currentStep ?
                      (step === 'Shipped' ? <FiTruck /> : step === 'Delivered' ? <FiMapPin /> : <FiPackage />) :
                      <span>{idx + 1}</span>
                    }
                  </div>
                  <span className="step-label">{step}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="cancelled-banner card">
            <span>❌</span> This order has been cancelled
          </div>
        )}

        <div className="order-detail-grid">
          {/* Items */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>Order Items</h3>
            {order.items.map((item, i) => (
              <div key={i} className="od-item">
                <img src={getProductImage(item.image, 'https://via.placeholder.com/80')} alt={item.name} />

                <div className="od-item-info">
                  <p className="od-item-name">{item.name}</p>
                  <span>Size: {item.size} {item.color?.name ? `· Color: ${item.color.name}` : ''}</span>
                  <span>Qty: {item.quantity}</span>
                </div>
                <div className="od-item-price">
                  <strong>₹{item.totalPrice?.toLocaleString()}</strong>
                  <span>₹{item.priceAtPurchase?.toLocaleString()} each</span>
                </div>
              </div>
            ))}
          </div>

          <div className="order-detail-sidebar">
            {/* Price Breakdown */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>Price Details</h3>
              <div className="summary-rows">
                <div className="summary-row"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span></div>
                <div className="summary-row"><span>Shipping</span><span className={order.shippingCharge === 0 ? 'free' : ''}>{order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}</span></div>
                <div className="summary-row total"><span>Total</span><span>₹{order.totalAmount?.toLocaleString()}</span></div>
              </div>
              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                <p>Payment: <strong>{order.paymentMethod}</strong></p>
                <p>Status: <strong style={{ color: order.paymentStatus === 'Paid' ? '#388e3c' : '#e65100' }}>{order.paymentStatus}</strong></p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 12, fontSize: 16, fontWeight: 700 }}>Delivery Address</h3>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{order.shippingAddress?.fullName}</strong><br />
                {order.shippingAddress?.addressLine1}<br />
                {order.shippingAddress?.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}<br />
                Phone: {order.shippingAddress?.phone}
              </div>
            </div>

            {/* Cancel */}
            {!isCancelled && !['Shipped', 'Delivered'].includes(order.orderStatus) && (
              <button className="btn btn-outline btn-block" style={{ color: '#e53935', borderColor: '#e53935' }} onClick={handleCancel}>
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
