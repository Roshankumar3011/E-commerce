import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { AdminLayout } from './Dashboard';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './Admin.css';

const statusColors = {
  Pending: 'badge-warning', Confirmed: 'badge-info', Processing: 'badge-info',
  Shipped: 'badge-primary', 'Out for Delivery': 'badge-info', Delivered: 'badge-success', Cancelled: 'badge-danger',
};
const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

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
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [search, statusFilter]);
  useEffect(() => { fetchOrders(); }, [page, search, statusFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try { await API.put(`/admin/orders/${orderId}/status`, { status: newStatus }); toast.success(`→ ${newStatus}`); fetchOrders(); }
    catch { toast.error('Failed'); }
  };

  const hasFilters = statusFilter;
  const clearFilters = () => { setStatusFilter(''); setSearch(''); };

  return (
    <AdminLayout title="Orders">
      <div className="admin-toolbar">
        <div className="admin-search"><FiSearch /><input placeholder="Search order #..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        {hasFilters && <button className="filter-clear-btn" onClick={clearFilters}><FiX /> Clear</button>}
      </div>

      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          <span className="filter-group-label">Status</span>
          <div className="filter-chips">
            {statuses.map(s => (
              <button key={s} className={`filter-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(statusFilter === s ? '' : s)}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-results-info">{loading ? 'Loading…' : `${pagination.total ?? orders.length} orders`}</div>

      <div className="admin-section">
        {loading ? <div className="loading-container"><div className="spinner" /></div> : (
          <>
            {/* Desktop table */}
            <div className="admin-table-wrap desktop-only">
              <table className="admin-table">
                <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th><th>Update</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td><strong>{o.orderNumber}</strong></td>
                      <td><div>{o.user?.name || 'N/A'}</div><small style={{ color: '#94a3b8' }}>{o.user?.email}</small></td>
                      <td>{o.items?.length || 0}</td>
                      <td><strong>₹{o.totalAmount?.toLocaleString()}</strong></td>
                      <td><span className={`badge ${o.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{o.paymentStatus}</span></td>
                      <td><span className={`badge ${statusColors[o.orderStatus]}`}>{o.orderStatus}</span></td>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td><select value={o.orderStatus} onChange={e => handleStatusUpdate(o._id, e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--admin-border)', fontSize: 12 }}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mobile-cards mobile-only">
              {orders.length === 0 && <p className="empty-msg">No orders found.</p>}
              {orders.map(o => (
                <div key={o._id} className="m-card">
                  <div className="m-card-header">
                    <div className="m-card-info">
                      <div className="m-card-title">#{o.orderNumber}</div>
                      <div className="m-card-date">{new Date(o.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="m-card-price">₹{o.totalAmount?.toLocaleString()}</div>
                  </div>
                  <div className="m-card-meta">
                    <span className={`badge ${statusColors[o.orderStatus]}`}>{o.orderStatus}</span>
                    <span className={`badge ${o.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{o.paymentStatus}</span>
                  </div>
                  <div className="m-card-footer">
                    <select value={o.orderStatus} onChange={e => handleStatusUpdate(o._id, e.target.value)} className="m-card-select">
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {pagination.pages > 1 && (
          <div className="pagination" style={{ marginTop: 16 }}>
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
