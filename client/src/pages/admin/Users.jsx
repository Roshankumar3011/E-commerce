import { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiToggleLeft, FiToggleRight, FiX } from 'react-icons/fi';
import { AdminLayout } from './Dashboard';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: 100 });
      if (search) params.set('search', search);
      const res = await API.get(`/admin/users?${params}`);
      setUsers(res.data.users);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const handleToggle = async (userId) => {
    try { await API.put(`/admin/users/${userId}/toggle`); toast.success('Updated'); fetchUsers(); }
    catch { toast.error('Failed'); }
  };

  const filtered = useMemo(() => {
    let list = users;
    if (roleFilter) list = list.filter(u => u.role === roleFilter);
    if (statusFilter === 'active') list = list.filter(u => u.isActive);
    if (statusFilter === 'inactive') list = list.filter(u => !u.isActive);
    return list;
  }, [users, roleFilter, statusFilter]);

  const hasFilters = roleFilter || statusFilter;
  const clearFilters = () => { setRoleFilter(''); setStatusFilter(''); setSearch(''); };

  return (
    <AdminLayout title="Users">
      <div className="admin-toolbar">
        <div className="admin-search"><FiSearch /><input placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        {hasFilters && <button className="filter-clear-btn" onClick={clearFilters}><FiX /> Clear</button>}
      </div>

      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          <span className="filter-group-label">Role</span>
          <div className="filter-chips">
            {['admin','user'].map(r => (
              <button key={r} className={`filter-chip ${roleFilter === r ? 'active' : ''}`} onClick={() => setRoleFilter(roleFilter === r ? '' : r)}>{r === 'admin' ? 'Admin' : 'User'}</button>
            ))}
          </div>
        </div>
        <div className="admin-filter-group">
          <span className="filter-group-label">Status</span>
          <div className="filter-chips">
            <button className={`filter-chip ${statusFilter === 'active' ? 'active' : ''}`} onClick={() => setStatusFilter(statusFilter === 'active' ? '' : 'active')}>Active</button>
            <button className={`filter-chip ${statusFilter === 'inactive' ? 'active' : ''}`} onClick={() => setStatusFilter(statusFilter === 'inactive' ? '' : 'inactive')}>Inactive</button>
          </div>
        </div>
      </div>

      <div className="admin-results-info">{loading ? 'Loading…' : `${filtered.length} users`}</div>

      <div className="admin-section">
        {loading ? <div className="loading-container"><div className="spinner" /></div> : (
          <>
            {/* Desktop table */}
            <div className="admin-table-wrap desktop-only">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u._id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.phone || '—'}</td>
                      <td><span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>{u.role}</span></td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>{u.role !== 'admin' && <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(u._id)}>{u.isActive ? <FiToggleRight style={{ color: '#388e3c', fontSize: 20 }} /> : <FiToggleLeft style={{ color: '#999', fontSize: 20 }} />}</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mobile-cards mobile-only">
              {filtered.length === 0 && <p className="empty-msg">No users found.</p>}
              {filtered.map(u => (
                <div key={u._id} className="m-card">
                  <div className="m-card-header">
                    <div className="m-card-info">
                      <div className="m-card-title">{u.name}</div>
                    </div>
                    <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>{u.role}</span>
                  </div>
                  <div className="m-card-footer">
                    <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                    <span className="m-card-date">{new Date(u.createdAt).toLocaleDateString()}</span>
                    {u.role !== 'admin' && (
                      <button className="m-action-btn toggle" onClick={() => handleToggle(u._id)}>
                        {u.isActive ? <><FiToggleRight /> Deactivate</> : <><FiToggleLeft /> Activate</>}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
