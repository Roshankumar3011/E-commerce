import { NavLink } from 'react-router-dom';
import { FiHome, FiShoppingCart, FiUser, FiGrid } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import './MobileTabs.css';

const MobileTabs = () => {
  const { cartCount } = useCart();

  return (
    <div className="mobile-tabs">
      <NavLink to="/" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        <FiHome className="tab-icon" />
        <span className="tab-label">Home</span>
      </NavLink>

      <NavLink to="/categories" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        <FiGrid className="tab-icon" />
        <span className="tab-label">Categories</span>
      </NavLink>

      <NavLink to="/cart" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        <div className="tab-icon-wrapper">
          <FiShoppingCart className="tab-icon" />
          {cartCount > 0 && <span className="tab-badge">{cartCount}</span>}
        </div>
        <span className="tab-label">Cart</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        <FiUser className="tab-icon" />
        <span className="tab-label">Profile</span>
      </NavLink>
    </div>
  );
};

export default MobileTabs;
