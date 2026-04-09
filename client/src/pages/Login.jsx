import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    try {
      setLoading(true);
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <h2>Login</h2>
          <p>Get access to your Orders, Wishlist and Recommendations</p>
          <div className="auth-illustration">🛍️</div>
        </div>
        <div className="auth-right">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <FiMail className="auth-input-icon" />
              <input
                type="email" placeholder="Email Address"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="auth-input-group">
              <FiLock className="auth-input-icon" />
              <input
                type={showPass ? 'text' : 'password'} placeholder="Password"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="auth-divider"><span>OR</span></div>

            <div className="demo-logins">
              <button type="button" className="demo-btn" onClick={() => { setEmail('john@example.com'); setPassword('user123'); }}>
                👤 Demo User Login
              </button>
              <button type="button" className="demo-btn admin" onClick={() => { setEmail('admin@flipkart.com'); setPassword('admin123'); }}>
                🔑 Demo Admin Login
              </button>
            </div>

            <p className="auth-switch">
              New to FlipStyle? <Link to="/register">Create an account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
