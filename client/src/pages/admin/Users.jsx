import { useState, useEffect } from 'react';
import { FiSearch, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { AdminLayout } from './Dashboard';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: 50 });
      if (search) params.set('search', search);
      const res = await API.get(`/admin/users?${params}`);
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const handleToggle = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/toggle`);
      toast.success('User status updated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  return (
    <AdminLayout title="Users">
      <div className="admin-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input placeholder="Search users by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="admin-section">
        {loading ? (
          <div className="loading-container"><div className="spinner"></div></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>{u.role}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      {u.role !== 'admin' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(u._id)} title={u.isActive ? 'Deactivate' : 'Activate'}>
                          {u.isActive ? <FiToggleRight style={{ color: '#388e3c', fontSize: 20 }} /> : <FiToggleLeft style={{ color: '#999', fontSize: 20 }} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
