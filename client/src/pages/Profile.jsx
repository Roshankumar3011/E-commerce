import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiPackage, FiHeart, FiChevronRight, FiLogOut } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, setUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });

  const handleSave = async () => {
    try {
      await updateProfile(form);
      setEditing(false);
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };



  const handleAddAddress = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const addr = Object.fromEntries(formData);
    try {
      const res = await API.post('/auth/address', addr);
      setUser({ ...user, addresses: res.data.addresses });
      toast.success('Address added!');
      e.target.reset();
    } catch (err) {
      toast.error('Failed to add address');
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      const res = await API.delete(`/auth/address/${addrId}`);
      setUser({ ...user, addresses: res.data.addresses });
      toast.success('Address removed');
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  return (
    <div className="profile-page animate-fadeIn">
      <div className="page-header">
        <div className="container"><h1>My Profile</h1></div>
      </div>
      <div className="container">
        <div className="profile-grid">
          {/* Profile Info */}
          <div className="card profile-card">
            <div className="profile-avatar">
              <div className="avatar-circle">{user?.name?.charAt(0)?.toUpperCase()}</div>
            </div>
            <div className="profile-fields">
              {editing ? (
                <>
                  <div className="input-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({...form, name:e.target.value})} /></div>
                  <div className="input-group"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({...form, phone:e.target.value})} /></div>
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn btn-primary btn-sm" onClick={handleSave}><FiSave /> Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="profile-field"><FiUser /><div><label>Name</label><p>{user?.name}</p></div></div>
                  <div className="profile-field"><FiMail /><div><label>Email</label><p>{user?.email}</p></div></div>
                  <div className="profile-field"><FiPhone /><div><label>Phone</label><p>{user?.phone || 'Not provided'}</p></div></div>
                  <div className="profile-card-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}><FiEdit2 /> Edit Profile</button>
                    <button className="btn btn-ghost btn-sm logout-btn-desktop" onClick={logout}>
                      <FiLogOut /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>


          <div className="profile-right">
            {/* Quick Activity Section (Orders/Wishlist) - Now always visible */}
            <div className="profile-activity-section">
              <h3 className="section-title">My Activity</h3>
              <div className="activity-links-grid">
                <Link to="/orders" className="activity-link-item">
                  <div className="link-icon orders"><FiPackage /></div>
                  <div className="link-text">
                    <span>My Orders</span>
                    <p>View, track or buy again</p>
                  </div>
                  <FiChevronRight className="link-arrow" />
                </Link>
                <Link to="/wishlist" className="activity-link-item">
                  <div className="link-icon wishlist"><FiHeart /></div>
                  <div className="link-text">
                    <span>My Wishlist</span>
                    <p>Items you've saved</p>
                  </div>
                  <FiChevronRight className="link-arrow" />
                </Link>
              </div>
            </div>



            {/* Addresses */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 16 }}>📍 Saved Addresses</h3>
              {user?.addresses?.map((addr) => (
                <div key={addr._id} className="address-card">
                  <div>
                    <strong>{addr.fullName}</strong> {addr.isDefault && <span className="badge badge-primary">Default</span>}
                    <p>{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    <p>Phone: {addr.phone}</p>
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{color:'var(--danger)'}} onClick={() => handleDeleteAddress(addr._id)}>Delete</button>
                </div>
              ))}
              <details style={{ marginTop: 16 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 14, color: 'var(--primary)' }}>+ Add New Address</summary>
                <form onSubmit={handleAddAddress} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
                  <div className="input-group"><label>Full Name</label><input name="fullName" required /></div>
                  <div className="input-group"><label>Phone</label><input name="phone" required /></div>
                  <div className="input-group" style={{gridColumn:'1/-1'}}><label>Address Line 1</label><input name="addressLine1" required /></div>
                  <div className="input-group"><label>City</label><input name="city" required /></div>
                  <div className="input-group"><label>State</label><input name="state" required /></div>
                  <div className="input-group"><label>Pincode</label><input name="pincode" required /></div>
                  <button type="submit" className="btn btn-primary btn-sm">Save Address</button>
                </form>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
