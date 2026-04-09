import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h3 className="footer-brand">
                <span>Flip</span><span className="accent">Style</span>
              </h3>
              <p>India's leading online fashion store. Discover the latest trends in clothing for Men, Women & Kids.</p>
              <div className="footer-social">
                <a href="#" className="social-link">f</a>
                <a href="#" className="social-link">𝕏</a>
                <a href="#" className="social-link">in</a>
                <a href="#" className="social-link">ig</a>
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
                <li><FiMail /> support@flipstyle.com</li>
                <li><FiPhone /> +91 1800-123-4567</li>
                <li><FiMapPin /> Mumbai, India</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2024 FlipStyle. All rights reserved.</p>
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
