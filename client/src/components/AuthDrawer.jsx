import { useState, useEffect } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiX, FiCheckCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import './AuthDrawer.css';

const AuthDrawer = ({ isOpen, onClose, onSuccess }) => {
  const { login, firebaseLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    try {
      setLoading(true);
      await login(email, password);
      toast.success('Login successful!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      if (import.meta.env.VITE_FIREBASE_API_KEY === "AIzaSyDummyKeyForDevelopmentPurposes") {
        await firebaseLogin("dummy_google_token");
        if (onSuccess) onSuccess();
        onClose();
        return;
      }
      
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      await firebaseLogin(token);
      toast.success('Login successful!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Google Auth failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || window.innerWidth <= 768) return null;

  return (
    <div className={`drawer-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="auth-drawer animate-slideLeft" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>Log in to complete your shopping</h3>
          <button className="drawer-close" onClick={onClose}><FiX /></button>
        </div>

        <div className="drawer-body">
          <div className="auth-prompt">
            <FiCheckCircle className="prompt-icon" />
            <p>Access your Orders, Wishlist and tailored recommendations</p>
          </div>

          <form onSubmit={handleEmailLogin} className="drawer-auth-form">
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  type="email" placeholder="Enter your email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-secondary btn-lg btn-block" disabled={loading}>
              {loading ? 'Logging in...' : 'Continue'}
            </button>
          </form>

          <div className="auth-divider"><span>OR</span></div>

          <button type="button" className="btn btn-outline btn-lg btn-block google-btn" onClick={handleGoogleLogin} disabled={loading}>
            <FcGoogle size={20} /> Continue with Google
          </button>
        </div>

        <div className="drawer-footer">
          <p>By continuing, you confirm that you are above 18 years of age, and you agree to Balajee's Terms of Use and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default AuthDrawer;
