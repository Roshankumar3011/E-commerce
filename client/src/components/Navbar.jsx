import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiChevronDown, FiPackage, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenu(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Flip</span>
          <span className="logo-accent">Style</span>
          <span className="logo-tagline">Explore <span>Plus</span></span>
        </Link>

        {/* Search */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for products, brands and more"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Nav Categories */}
        <div className={`navbar-categories ${mobileMenu ? 'show' : ''}`}>
          <Link to="/products/Men" className="nav-cat" onClick={() => setMobileMenu(false)}>Men</Link>
          <Link to="/products/Women" className="nav-cat" onClick={() => setMobileMenu(false)}>Women</Link>
          <Link to="/products/Kids" className="nav-cat" onClick={() => setMobileMenu(false)}>Kids</Link>
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {user ? (
            <div className="user-menu" ref={dropdownRef}>
              <button className="user-btn" onClick={() => setShowDropdown(!showDropdown)}>
                <FiUser />
                <span className="user-name">{user.name?.split(' ')[0]}</span>
                <FiChevronDown className={`chevron ${showDropdown ? 'open' : ''}`} />
              </button>
              {showDropdown && (
                <div className="dropdown-menu animate-fadeIn">
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <div className="dropdown-divider" />
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <FiSettings /> Admin Panel
                    </Link>
                  )}
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <FiUser /> My Profile
                  </Link>
                  <Link to="/orders" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <FiPackage /> My Orders
                  </Link>
                  <Link to="/wishlist" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <FiHeart /> My Wishlist
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}

          <Link to="/wishlist" className="nav-action-btn" title="Wishlist">
            <FiHeart />
          </Link>

          <Link to="/cart" className="nav-action-btn cart-btn" title="Cart">
            <FiShoppingCart />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          <button className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
