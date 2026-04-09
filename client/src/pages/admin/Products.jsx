import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import { AdminLayout } from './Dashboard';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      const res = await API.get(`/products?${params}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <AdminLayout title="Products">
      <div className="admin-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Link to="/admin/products/add" className="btn btn-primary"><FiPlus /> Add Product</Link>
      </div>

      <div className="admin-section">
        {loading ? (
          <div className="loading-container"><div className="spinner"></div></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td><img src={p.images?.[0] || 'https://via.placeholder.com/40'} alt="" style={{ width: 44, height: 55, borderRadius: 6, objectFit: 'cover' }} /></td>
                    <td style={{ maxWidth: 200, fontWeight: 500 }}>{p.name}</td>
                    <td>{p.brand}</td>
                    <td>
                      <strong>₹{p.price}</strong>
                      {p.originalPrice > p.price && <span style={{ fontSize: 11, color: '#999', textDecoration: 'line-through', marginLeft: 6 }}>₹{p.originalPrice}</span>}
                    </td>
                    <td>
                      <span className={`badge ${p.totalStock === 0 ? 'badge-danger' : p.totalStock < 10 ? 'badge-warning' : 'badge-success'}`}>
                        {p.totalStock}
                      </span>
                    </td>
                    <td>{p.ratings?.average || 0} ⭐ ({p.ratings?.count || 0})</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link to={`/admin/products/edit/${p._id}`} className="btn btn-ghost btn-sm" title="Edit"><FiEdit /></Link>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(p._id)} title="Delete"><FiTrash2 /></button>
                      </div>
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

export default AdminProducts;
