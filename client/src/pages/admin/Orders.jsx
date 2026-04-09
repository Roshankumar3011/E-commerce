import { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { AdminLayout } from './Dashboard';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './Admin.css';

const statusColors = {
  Pending: 'badge-warning', Confirmed: 'badge-info', Processing: 'badge-info',
  Shipped: 'badge-primary', 'Out for Delivery': 'badge-info', Delivered: 'badge-success', Cancelled: 'badge-danger',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await API.get(`/admin/orders?${params}`);
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, search, statusFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await API.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

  return (
    <AdminLayout title="Orders">
      <div className="admin-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input placeholder="Search by order number..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '10px 16px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, background: 'white' }}>
          <option value="">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="admin-section">
        {loading ? (
          <div className="loading-container"><div className="spinner"></div></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td><strong>{order.orderNumber}</strong></td>
                    <td>
                      <div>{order.user?.name || 'N/A'}</div>
                      <small style={{ color: 'var(--text-muted)' }}>{order.user?.email}</small>
                    </td>
                    <td>{order.items?.length || 0}</td>
                    <td><strong>₹{order.totalAmount?.toLocaleString()}</strong></td>
                    <td>
                      <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td><span className={`badge ${statusColors[order.orderStatus]}`}>{order.orderStatus}</span></td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12 }}
                      >
                        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="pagination" style={{ marginTop: 20, justifyContent: 'center' }}>
            {Array.from({ length: pagination.pages }, (_, i) => (
              <button key={i} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
