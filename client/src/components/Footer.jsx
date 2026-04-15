import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useSettings } from '../context/SettingsContext';
import './Footer.css';

const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <Link to="/" className="footer-brand">
                {settings?.logoUrl ? (
                   <img src={settings.logoUrl} alt="Store Logo" style={{ maxHeight: '35px' }} />
                ) : (
                   <><span className="logo-text">Bala</span><span className="accent">Jee</span></>
                )}
              </Link>
              <p>India's leading online fashion store. Discover the latest trends in clothing for Men, Women & Kids.</p>
              <div className="footer-social">
                {settings?.socialLinks?.facebook && <a href={settings.socialLinks.facebook} className="social-link" target="_blank" rel="noreferrer">f</a>}
                {settings?.socialLinks?.twitter && <a href={settings.socialLinks.twitter} className="social-link" target="_blank" rel="noreferrer">𝕏</a>}
                {settings?.socialLinks?.linkedin && <a href={settings.socialLinks.linkedin} className="social-link" target="_blank" rel="noreferrer">in</a>}
                {settings?.socialLinks?.instagram && <a href={settings.socialLinks.instagram} className="social-link" target="_blank" rel="noreferrer">ig</a>}
              </div>
            </div>

            <div className="footer-col">
              <h4>Shop</h4>
              <ul>
                <li><Link to="/products/Men">Men's Clothing</Link></li>
                <li><Link to="/products/Women">Women's Clothing</Link></li>
                <li><Link to="/products/Kids">Kids' Clothing</Link></li>
                <li><Link to="/products">All Products</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>My Account</h4>
              <ul>
                <li><Link to="/profile">My Profile</Link></li>
                <li><Link to="/orders">Order History</Link></li>
                <li><Link to="/wishlist">Wishlist</Link></li>
                <li><Link to="/cart">Shopping Cart</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Contact</h4>
              <ul className="contact-list">
                <li><FiMail /> {settings?.contact?.email || 'support@balajee.com'}</li>
                <li><FiPhone /> {settings?.contact?.phone || '+91 1800-123-4567'}</li>
                <li><FiMapPin /> {settings?.contact?.address || 'Mumbai, India'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2024 Balajee. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Returns Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
