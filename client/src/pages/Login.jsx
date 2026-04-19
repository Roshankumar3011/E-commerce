import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiUser, FiKey } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../utils/api';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectParams = new URLSearchParams(location.search).get('redirect') || '/';
  const { login, firebaseLogin, verifyOtp } = useAuth();
  
  const [authMode, setAuthMode] = useState('input'); // 'input', 'otp'
  const [contact, setContact] = useState(''); // Holds email or phone
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validatePhone = (p) => /^[0-9]{10}$/.test(p);

  const handleDemoLogin = async (demoEmail, demoPass) => {
    try {
      setLoading(true);
      const user = await login(demoEmail, demoPass);
      navigate(user.role === 'admin' ? '/admin' : redirectParams);
    } catch (err) {
      toast.error('Demo Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const isEmail = validateEmail(contact);
    const isPhone = validatePhone(contact);

    if (isPhone) {
      return toast.error('Mobile login coming soon! Please use Email for now.', { icon: '🚧' });
    }

    if (!isEmail) {
      return toast.error('Please enter a valid email address');
    }

    const type = 'email';

    try {
      setLoading(true);
      const res = await API.post('/auth/send-otp', { receiver: contact, type });
      if (res.data.success) {
        setAuthMode('otp');
        toast.success(`OTP sent to your ${type}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the 6-digit OTP');
    
    try {
      setLoading(true);
      const data = await verifyOtp(contact, otp);
      
      if (data.success) {
        if (!data.userExists) {
          toast.success('Verified! Please complete registration.');
          const isPhone = validatePhone(contact);
          navigate(`/register?${isPhone ? 'phone' : 'email'}=${contact}`);
        } else {
          navigate(data.user.role === 'admin' ? '/admin' : redirectParams);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
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
      navigate(user.role === 'admin' ? '/admin' : redirectParams);
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
          <h2 className="stagger-in stagger-delay-1">Login</h2>
          <p className="stagger-in stagger-delay-2">Get access to your Orders, Wishlist and Recommendations</p>
          <div className="auth-illustration stagger-in stagger-delay-3">
            <img 
              src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop" 
              alt="Fashion Retail Interior" 
            />
          </div>
        </div>
        <div className="auth-right">
          
          <div className="demo-logins stagger-in stagger-delay-1" style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <button type="button" className="btn btn-outline btn-sm flex-1" onClick={() => handleDemoLogin('john@example.com', 'user123')} disabled={loading}>
              <FiUser /> Demo User
            </button>
            <button type="button" className="btn btn-outline btn-sm flex-1" onClick={() => handleDemoLogin('admin@flipkart.com', 'admin123')} disabled={loading}>
              <FiKey /> Demo Admin
            </button>
          </div>

          {authMode === 'input' && (
            <form onSubmit={handleSendOtp} className="auth-form">
              <div className="auth-input-group stagger-in stagger-delay-1">
                <FiMail className="auth-input-icon" />
                <input
                  type="text" placeholder="Enter Email Address"
                  value={contact} onChange={(e) => setContact(e.target.value)}
                />
              </div>
              <p className="auth-notice stagger-in stagger-delay-2">By continuing, you agree to Balajee's Terms of Use and Privacy Policy.</p>
              <button type="submit" className="btn btn-primary btn-lg btn-block stagger-in stagger-delay-3" disabled={loading}>
                {loading ? 'Requesting...' : 'Request OTP'}
              </button>
            </form>
          )}

          {authMode === 'otp' && (
             <form onSubmit={handleVerifyOtp} className="auth-form">
                <p style={{marginBottom: '10px', fontSize:'14px', color: '#666'}}>OTP sent to {contact}</p>
                <div className="auth-input-group stagger-in stagger-delay-1">
                  <FiLock className="auth-input-icon" />
                  <input
                    type="text" placeholder="Enter OTP"
                    value={otp} onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-block stagger-in stagger-delay-2" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
             </form>
          )}

          <div className="auth-divider stagger-in stagger-delay-4" style={{marginTop: '20px'}}><span>OR</span></div>

          <button type="button" className="btn btn-outline btn-lg btn-block stagger-in stagger-delay-5" onClick={handleGoogleLogin} disabled={loading} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
             <FcGoogle size={24} /> Continue with Google
          </button>

          <p className="auth-switch stagger-in stagger-delay-5" style={{marginTop: '20px'}}>
            New to Balajee? <Link to="/register">Create an account</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;
