import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import API from '../utils/api';
import { getProductImage } from '../utils/assets';
import './Orders.css';

const statusColors = {
  Pending: 'badge-warning', Confirmed: 'badge-info', Processing: 'badge-info',
  Shipped: 'badge-primary', 'Out for Delivery': 'badge-info', Delivered: 'badge-success', Cancelled: 'badge-danger',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get('/orders/my-orders');
        setOrders(res.data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="orders-page animate-fadeIn">
      <div className="page-header">
        <div className="container">
          <h1>My Orders</h1>
          <p className="breadcrumb">Track and manage your orders</p>
        </div>
      </div>
      <div className="container">
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FiPackage size={48} opacity={0.25} /></div>
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here</p>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <Link to={`/order/${order._id}`} key={order._id} className="order-card card">
                <div className="order-card-header">
                  <div>
                    <span className="order-num">#{order.orderNumber}</span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <span className={`badge ${statusColors[order.orderStatus]}`}>{order.orderStatus}</span>
                </div>
                <div className="order-items-preview">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <div key={i} className="order-item-mini">
                      <img src={getProductImage(item.image || item.product?.images?.[0], 'https://via.placeholder.com/50')} alt="" />

                      <div>
                        <p>{item.name || item.product?.name}</p>
                        <span>Size: {item.size} · Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && <p className="more-items">+{order.items.length - 3} more items</p>}
                </div>
                <div className="order-card-footer">
                  <strong>₹{order.totalAmount?.toLocaleString()}</strong>
                  <span className="view-detail">View Details <FiChevronRight /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
