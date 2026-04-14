import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiPhone } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, firebaseLogin } = useAuth();
  
  const [authMode, setAuthMode] = useState('email'); // 'email', 'phone', 'otp'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  }, []);

  const handleEmailLogin = async (e) => {
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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // Dummy bypass if Firebase isn't properly configured yet but user clicks
      if (import.meta.env.VITE_FIREBASE_API_KEY === "AIzaSyDummyKeyForDevelopmentPurposes") {
        await firebaseLogin("dummy_google_token");
        navigate('/');
        return;
      }
      
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) return toast.error('Please enter a valid phone number');
    try {
      setLoading(true);
      
      if (import.meta.env.VITE_FIREBASE_API_KEY === "AIzaSyDummyKeyForDevelopmentPurposes") {
        // Mock SMS sent
        setConfirmationResult({ mock: true });
        setAuthMode('otp');
        toast.success('Mock OTP sent (Any code works)');
        return;
      }

      const formattedPhone = phone.startsWith('+') ? phone : '+91' + phone;
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setAuthMode('otp');
      toast.success('OTP sent successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the OTP');
    try {
      setLoading(true);
      
      if (confirmationResult?.mock) {
         await firebaseLogin("dummy_phone_token");
         navigate('/');
         return;
      }

      const result = await confirmationResult.confirm(otp);
      const token = await result.user.getIdToken();
      const user = await firebaseLogin(token);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error('Invalid OTP');
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
          <div id="recaptcha-container"></div>
          
          <div className="auth-tabs stagger-in stagger-delay-1" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button type="button" className={`btn ${authMode === 'email' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setAuthMode('email')}>Email</button>
            <button type="button" className={`btn ${authMode === 'phone' || authMode === 'otp' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setAuthMode('phone')}>Phone OTP</button>
          </div>

          {authMode === 'email' && (
            <form onSubmit={handleEmailLogin} className="auth-form">
              <div className="auth-input-group stagger-in stagger-delay-1">
                <FiMail className="auth-input-icon" />
                <input
                  type="email" placeholder="Email Address"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="auth-input-group stagger-in stagger-delay-2">
                <FiLock className="auth-input-icon" />
                <input
                  type={showPass ? 'text' : 'password'} placeholder="Password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <div className="demo-logins stagger-in stagger-delay-2" style={{margin: '10px 0'}}>
                <button type="button" className="demo-btn" onClick={() => { setEmail('john@example.com'); setPassword('user123'); }}>
                  👤 Demo User
                </button>
                <button type="button" className="demo-btn" onClick={() => { setEmail('admin@flipkart.com'); setPassword('admin123'); }}>
                  🔑 Demo Admin
                </button>
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-block stagger-in stagger-delay-3" disabled={loading}>
                {loading ? 'Logging in...' : 'Login with Email'}
              </button>
            </form>
          )}

          {authMode === 'phone' && (
             <form onSubmit={handleSendOtp} className="auth-form">
                <div className="auth-input-group stagger-in stagger-delay-1">
                  <FiPhone className="auth-input-icon" />
                  <input
                    type="tel" placeholder="Phone Number (e.g. 9876543210)"
                    value={phone} onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-block stagger-in stagger-delay-2" disabled={loading}>
                  {loading ? 'Requesting...' : 'Send OTP'}
                </button>
             </form>
          )}

          {authMode === 'otp' && (
             <form onSubmit={handleVerifyOtp} className="auth-form">
                <p style={{marginBottom: '10px', fontSize:'14px', color: '#666'}}>OTP sent to {phone}</p>
                <div className="auth-input-group stagger-in stagger-delay-1">
                  <FiLock className="auth-input-icon" />
                  <input
                    type="text" placeholder="Enter OTP"
                    value={otp} onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-block stagger-in stagger-delay-2" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
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
