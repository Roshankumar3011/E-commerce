import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiPackage, FiShoppingBag, FiUsers, FiLogOut, FiPlus, FiTrendingUp, FiAlertTriangle, FiGrid, FiUser, FiSettings, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import './Admin.css';

const AdminLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const navItems = [
    { path: '/admin', icon: <FiHome />, label: 'Dashboard' },
    { path: '/admin/products', icon: <FiShoppingBag />, label: 'Products' },
    { path: '/admin/categories', icon: <FiGrid />, label: 'Categories' },
    { path: '/admin/orders', icon: <FiPackage />, label: 'Orders' },
    { path: '/admin/users', icon: <FiUsers />, label: 'Users' },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      {showMobileSidebar && <div className="admin-sidebar-overlay" onClick={() => setShowMobileSidebar(false)} />}

      <aside className={`admin-sidebar ${showMobileSidebar ? 'show' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-logo">
            <span>BALA</span><span className="accent">JEE</span>
          </Link>
          <button className="admin-sidebar-close" onClick={() => setShowMobileSidebar(false)}><FiX /></button>
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => setShowMobileSidebar(false)}>
              {item.icon} {item.label}
            </Link>
          ))}
          <Link to="/admin/products/add" className="admin-nav-item add-btn" onClick={() => setShowMobileSidebar(false)}>
            <FiPlus /> Add Product
          </Link>
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/admin/settings" className="admin-nav-item" onClick={() => setShowMobileSidebar(false)}><FiSettings /> Edit Store</Link>
          <button className="admin-nav-item logout" onClick={() => { logout(); navigate('/'); }}>
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>
      <div className="admin-content">
        <header className="admin-topbar">
          <button className="admin-mobile-toggle" onClick={() => setShowMobileSidebar(true)}><FiGrid /></button>
          <h1>{title}</h1>
          <div className="admin-user"><FiUser /> {user?.name}</div>
        </header>
        <div className="admin-body">{children}</div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/admin/dashboard');
        setStats(res.data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <AdminLayout title="Dashboard"><div className="loading-container"><div className="spinner"></div></div></AdminLayout>;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: <FiUsers />, color: '#2874f0', bg: '#e3f2fd' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: <FiShoppingBag />, color: '#388e3c', bg: '#e8f5e9' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: <FiPackage />, color: '#e65100', bg: '#fff3e0' },
    { label: 'Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <FiTrendingUp />, color: '#7b1fa2', bg: '#f3e5f5' },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="stats-grid animate-fadeIn">
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
            <div>
              <p className="stat-label">{stat.label}</p>
              <h2 className="stat-value">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Alerts */}
      {stats?.lowStockProducts?.length > 0 && (
        <div className="admin-section animate-slideUp">
          <h3><FiAlertTriangle style={{ color: '#e65100' }} /> Low Stock Alert</h3>
          <div className="low-stock-list">
            {stats.lowStockProducts.map((p) => (
              <div key={p._id} className="low-stock-item">
                <img src={p.images?.[0] || 'https://via.placeholder.com/40'} alt="" />
                <span>{p.name}</span>
                <span className={`badge ${p.totalStock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                  {p.totalStock === 0 ? 'Out of Stock' : `${p.totalStock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="admin-section animate-slideUp">
        <h3>Recent Orders</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((order) => (
                <tr key={order._id}>
                  <td><strong>{order.orderNumber}</strong></td>
                  <td>{order.user?.name || 'N/A'}</td>
                  <td>₹{order.totalAmount?.toLocaleString()}</td>
                  <td><span className={`badge ${
                    order.orderStatus === 'Delivered' ? 'badge-success' :
                    order.orderStatus === 'Cancelled' ? 'badge-danger' :
                    order.orderStatus === 'Shipped' ? 'badge-primary' : 'badge-warning'
                  }`}>{order.orderStatus}</span></td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
export { AdminLayout };
