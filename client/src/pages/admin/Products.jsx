import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiStar, FiX } from 'react-icons/fi';
import { AdminLayout } from './Dashboard';
import API from '../../utils/api';
import { getProductImage } from '../../utils/assets';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15, sort: sortBy });
      if (search) params.set('search', search);
      if (gender) params.set('gender', gender);
      const res = await API.get(`/products?${params}`);
      let list = res.data.products || [];
      if (stockFilter === 'out') list = list.filter(p => p.totalStock === 0);
      else if (stockFilter === 'low') list = list.filter(p => p.totalStock > 0 && p.totalStock < 10);
      else if (stockFilter === 'in') list = list.filter(p => p.totalStock >= 10);
      setProducts(list);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [search, gender, stockFilter, sortBy]);
  useEffect(() => { fetchProducts(); }, [page, search, gender, stockFilter, sortBy]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await API.delete(`/products/${id}`); toast.success('Deleted'); fetchProducts(); }
    catch { toast.error('Failed'); }
  };

  const hasFilters = gender || stockFilter || sortBy !== '-createdAt';
  const clearFilters = () => { setGender(''); setStockFilter(''); setSortBy('-createdAt'); setSearch(''); };

  return (
    <AdminLayout title="Products">
      <div className="admin-toolbar">
        <div className="admin-search"><FiSearch /><input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Link to="/admin/products/add" className="btn btn-primary"><FiPlus /> Add Product</Link>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          <span className="filter-group-label">Gender</span>
          <div className="filter-chips">
            {['Men','Women','Kids'].map(g => (
              <button key={g} className={`filter-chip ${gender === g ? 'active' : ''}`} onClick={() => setGender(gender === g ? '' : g)}>{g}</button>
            ))}
          </div>
        </div>
        <div className="admin-filter-group">
          <span className="filter-group-label">Stock</span>
          <div className="filter-chips">
            {[{l:'In Stock',v:'in'},{l:'Low',v:'low'},{l:'Out',v:'out'}].map(s => (
              <button key={s.v} className={`filter-chip ${stockFilter === s.v ? 'active' : ''}`} onClick={() => setStockFilter(stockFilter === s.v ? '' : s.v)}>{s.l}</button>
            ))}
          </div>
        </div>
        <div className="admin-filter-group">
          <span className="filter-group-label">Sort</span>
          <div className="filter-chips">
            {[{l:'New',v:'-createdAt'},{l:'Price ↑',v:'price'},{l:'Price ↓',v:'-price'}].map(s => (
              <button key={s.v} className={`filter-chip ${sortBy === s.v ? 'active' : ''}`} onClick={() => setSortBy(s.v)}>{s.l}</button>
            ))}
          </div>
        </div>
        {hasFilters && <button className="filter-clear-btn" onClick={clearFilters}><FiX /> Clear</button>}
      </div>

      <div className="admin-results-info">{loading ? 'Loading…' : `${pagination.total ?? products.length} products`}</div>

      <div className="admin-section">
        {loading ? <div className="loading-container"><div className="spinner" /></div> : (
          <>
            {/* Desktop table */}
            <div className="admin-table-wrap desktop-only">
              <table className="admin-table">
                <thead><tr><th>Image</th><th>Name</th><th>Brand</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td><img src={getProductImage(p.images?.[0], 'https://via.placeholder.com/40')} alt="" style={{ width: 44, height: 55, borderRadius: 6, objectFit: 'cover' }} /></td>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td>{p.brand}</td>
                      <td><strong>₹{p.price}</strong>{p.originalPrice > p.price && <span style={{ fontSize: 11, color: '#999', textDecoration: 'line-through', marginLeft: 6 }}>₹{p.originalPrice}</span>}</td>
                      <td><span className={`badge ${p.totalStock === 0 ? 'badge-danger' : p.totalStock < 10 ? 'badge-warning' : 'badge-success'}`}>{p.totalStock}</span></td>
                      <td><FiStar style={{ color: 'var(--primary)', fill: 'var(--primary)', marginRight: 4 }} />{p.ratings?.average || 0}</td>
                      <td><div style={{ display: 'flex', gap: 6 }}><Link to={`/admin/products/edit/${p._id}`} className="btn btn-ghost btn-sm"><FiEdit /></Link><button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(p._id)}><FiTrash2 /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mobile-cards mobile-only">
              {products.length === 0 && <p className="empty-msg">No products found.</p>}
              {products.map(p => (
                <div key={p._id} className="m-card">
                  <div className="m-card-header">
                    <img src={getProductImage(p.images?.[0], 'https://via.placeholder.com/40')} alt="" className="m-card-img" />
                    <div className="m-card-info">
                      <div className="m-card-title">{p.name}</div>
                    </div>
                    <div className="m-card-price">₹{p.price}</div>
                  </div>
                  <div className="m-card-footer">
                    <span className={`badge ${p.totalStock === 0 ? 'badge-danger' : p.totalStock < 10 ? 'badge-warning' : 'badge-success'}`}>
                      {p.totalStock === 0 ? 'Out' : p.totalStock < 10 ? `${p.totalStock} left` : `${p.totalStock} in stock`}
                    </span>
                    <div className="m-card-actions">
                      <Link to={`/admin/products/edit/${p._id}`} className="m-action-btn edit"><FiEdit /> Edit</Link>
                      <button className="m-action-btn delete" onClick={() => handleDelete(p._id)}><FiTrash2 /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {pagination.pages > 1 && (
          <div className="pagination" style={{ marginTop: 16, justifyContent: 'center' }}>
            {Array.from({ length: pagination.pages }, (_, i) => (
              <button key={i} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
