import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      setLoading(true);
      await register(form.name, form.email, form.password, form.phone);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <h2>Create Account</h2>
          <p>Sign up to explore thousands of products and exclusive deals</p>
          <div className="auth-illustration">✨</div>
        </div>
        <div className="auth-right">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <FiUser className="auth-input-icon" />
              <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
            </div>
            <div className="auth-input-group">
              <FiMail className="auth-input-icon" />
              <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} />
            </div>
            <div className="auth-input-group">
              <FiPhone className="auth-input-icon" />
              <input type="tel" name="phone" placeholder="Phone Number (optional)" value={form.phone} onChange={handleChange} />
            </div>
            <div className="auth-input-group">
              <FiLock className="auth-input-icon" />
              <input type={showPass ? 'text' : 'password'} name="password" placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange} />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            <p className="auth-switch">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
