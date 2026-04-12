import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiChevronDown, FiPackage, FiLogOut, FiSettings, FiClock, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../utils/api';
import './Navbar.css';

const RECENT_KEY = 'flipstyle_recent_searches';
const MAX_RECENT = 6;

const getRecentSearches = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; }
  catch { return []; }
};

const saveSearch = (query) => {
  const prev = getRecentSearches().filter(q => q !== query);
  localStorage.setItem(RECENT_KEY, JSON.stringify([query, ...prev].slice(0, MAX_RECENT)));
};

const removeRecentSearch = (query) => {
  const updated = getRecentSearches().filter(q => q !== query);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchSuggestions = async (q) => {
    if (q.length < 2) { setSuggestions([]); return; }
    setLoadingSuggestions(true);
    try {
      const { data } = await API.get(`/products/search/suggestions?q=${encodeURIComponent(q)}`);
      setSuggestions(data.suggestions);
    } catch (err) { console.error(err); }
    finally { setLoadingSuggestions(false); }
  };

  const onSearchChange = (val) => {
    setSearchQuery(val);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const onFocus = () => {
    setRecentSearches(getRecentSearches());
    setShowSuggestions(true);
  };

  const handleSearch = (e, q = searchQuery) => {
    if (e) e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) {
      saveSearch(trimmed);
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
      setSearchQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
      setMobileMenu(false);
    }
  };

  const selectSuggestion = (text) => {
    saveSearch(text);
    navigate(`/products?search=${encodeURIComponent(text)}`);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleRemoveRecent = (e, q) => {
    e.stopPropagation();
    removeRecentSearch(q);
    setRecentSearches(getRecentSearches());
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const showRecentPanel = showSuggestions && searchQuery.length === 0 && recentSearches.length > 0;
  const showSuggestPanel = showSuggestions && suggestions.length > 0 && searchQuery.length > 0;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-text">FLIP</span>
          <span className="logo-accent">STYLE</span>
        </Link>


        {/* Search */}
        <div className="navbar-search" ref={searchRef}>
          <form onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={onFocus}
                autoComplete="off"
              />
              <button type="submit" className="search-btn">Search</button>
            </div>
          </form>

          {/* Recent Searches Panel */}
          {showRecentPanel && (
            <div className="search-suggestions animate-fadeIn">
              <div className="suggest-section-header">
                <FiClock size={12} /> Recent Searches
              </div>
              {recentSearches.map((q) => (
                <div key={q} className="suggestion-item" onClick={() => selectSuggestion(q)}>
                  <FiClock className="suggest-icon" />
                  <div className="suggest-content">
                    <span className="suggest-text">{q}</span>
                  </div>
                  <button className="suggest-remove" onClick={(e) => handleRemoveRecent(e, q)}>
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Live Suggestions Panel */}
          {showSuggestPanel && (
            <div className="search-suggestions animate-fadeIn">
              <div className="suggest-section-header">
                <FiTrendingUp size={12} /> Suggestions
              </div>
              {suggestions.map((s) => (
                <div key={s.id} className="suggestion-item" onClick={() => selectSuggestion(s.text)}>
                  <FiSearch className="suggest-icon" />
                  <div className="suggest-content">
                    <span className="suggest-text">{s.text}</span>
                    <div className="suggest-meta">
                      {s.brand && <span className="suggest-brand">{s.brand}</span>}
                      {s.category && <span className="suggest-cat">in {s.category}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
