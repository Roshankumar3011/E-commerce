import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, firebaseLogin } = useAuth();
  
  const [authMode, setAuthMode] = useState('email'); // 'email', 'phone', 'otp'
  
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  
  const [phone, setPhoneAuth] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-reg', {
        'size': 'invisible'
      });
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEmailRegister = async (e) => {
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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
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
          <h2 className="stagger-in stagger-delay-1">Create Account</h2>
          <p className="stagger-in stagger-delay-2">Sign up to explore thousands of products and exclusive deals</p>
          <div className="auth-illustration stagger-in stagger-delay-3" style={{marginTop: '40px'}}>
             <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop" alt="Shopping Store" />
          </div>
        </div>
        <div className="auth-right">
          <div id="recaptcha-container-reg"></div>
          
          <div className="auth-tabs stagger-in stagger-delay-1" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button type="button" className={`btn ${authMode === 'email' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setAuthMode('email')}>Email</button>
            <button type="button" className={`btn ${authMode === 'phone' || authMode === 'otp' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setAuthMode('phone')}>Phone OTP</button>
          </div>

          {authMode === 'email' && (
            <form onSubmit={handleEmailRegister} className="auth-form">
              <div className="auth-input-group stagger-in stagger-delay-1">
                <FiUser className="auth-input-icon" />
                <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
              </div>
              <div className="auth-input-group stagger-in stagger-delay-2">
                <FiMail className="auth-input-icon" />
                <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} />
              </div>
              <div className="auth-input-group stagger-in stagger-delay-2">
                <FiPhone className="auth-input-icon" />
                <input type="tel" name="phone" placeholder="Phone Number (optional)" value={form.phone} onChange={handleChange} />
              </div>
              <div className="auth-input-group stagger-in stagger-delay-3">
                <FiLock className="auth-input-icon" />
                <input type={showPass ? 'text' : 'password'} name="password" placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange} />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-block stagger-in stagger-delay-4" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {authMode === 'phone' && (
             <form onSubmit={handleSendOtp} className="auth-form">
                <div className="auth-input-group stagger-in stagger-delay-1">
                  <FiPhone className="auth-input-icon" />
                  <input
                    type="tel" placeholder="Phone Number (e.g. 9876543210)"
                    value={phone} onChange={(e) => setPhoneAuth(e.target.value)}
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
                  {loading ? 'Verifying...' : 'Verify & Register'}
                </button>
             </form>
          )}

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
