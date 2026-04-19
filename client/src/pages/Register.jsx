import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, firebaseLogin } = useAuth();
  
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for pre-filled data from OTP redirection
    const params = new URLSearchParams(location.search);
    const preEmail = params.get('email');
    const prePhone = params.get('phone');
    
    if (preEmail || prePhone) {
      setForm(prev => ({
        ...prev,
        email: preEmail || prev.email,
        phone: prePhone || prev.phone
      }));
    }
  }, [location]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    if (!form.name || (!form.email && !form.phone)) {
      return toast.error('Please provide your name and contact details');
    }
    
    // Auto-generate strong secure password for backend validation
    const autoGenPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);

    try {
      setLoading(true);
      await register(form.name, form.email, autoGenPassword, form.phone);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { signInWithPopup, googleProvider, auth } = await import('../firebase');
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      const user = await firebaseLogin(token);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.message || 'Google Auth failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ minHeight: '600px' }}>
        <div className="auth-left">
          <h2 className="stagger-in stagger-delay-1">Create Account</h2>
          <p className="stagger-in stagger-delay-2">Sign up to explore thousands of products and exclusive deals</p>
          <div className="auth-illustration stagger-in stagger-delay-3" style={{marginTop: '40px'}}>
             <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop" alt="Shopping Store" />
          </div>
        </div>
        <div className="auth-right">
          
          <form onSubmit={handleEmailRegister} className="auth-form">
            <div className="auth-input-group stagger-in stagger-delay-1">
              <FiUser className="auth-input-icon" />
              <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
            </div>
            <div className="auth-input-group stagger-in stagger-delay-2">
              <FiMail className="auth-input-icon" />
              <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} />
            </div>
            {/* 
            <div className="auth-input-group stagger-in stagger-delay-2">
              <FiPhone className="auth-input-icon" />
              <input type="tel" name="phone" placeholder="Phone Number (optional)" value={form.phone} onChange={handleChange} />
            </div>
            */}
            <button type="submit" className="btn btn-primary btn-lg btn-block stagger-in stagger-delay-4" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-divider stagger-in stagger-delay-5" style={{marginTop: '20px'}}><span>OR</span></div>

          <button type="button" className="btn btn-outline btn-lg btn-block stagger-in stagger-delay-6" onClick={handleGoogleLogin} disabled={loading} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
             <FcGoogle size={24} /> Sign up with Google
          </button>

          <p className="auth-switch stagger-in stagger-delay-6" style={{marginTop: '20px'}}>
            Already have an account? <Link to="/login">Login</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;
