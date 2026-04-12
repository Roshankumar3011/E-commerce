import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProductImage } from '../utils/assets';
import toast from 'react-hot-toast';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const products = wishlist.products || [];

  return (
    <div className="wishlist-page animate-fadeIn">
      <div className="page-header">
        <div className="container"><h1>My Wishlist ({products.length})</h1></div>
      </div>
      <div className="container">
        {products.length === 0 ? (
          <div className="empty-page-container" style={{ paddingTop: 40 }}>
            <div className="empty-page-inner">
              <div className="empty-page-illustration">
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" r="90" fill="#FFF1F2" />
                  <path d="M100 140 C65 115 45 95 45 78 C45 62 57 50 72 50 C83 50 93 57 100 67 C107 57 117 50 128 50 C143 50 155 62 155 78 C155 95 135 115 100 140Z" fill="#FCA5A5" />
                  <path d="M100 135 C68 112 50 93 50 78 C50 65 60 55 72 55 C82 55 91 61 100 70 C109 61 118 55 128 55 C140 55 150 65 150 78 C150 93 132 112 100 135Z" fill="#F87171" />
                  <circle cx="155" cy="55" r="14" fill="#FEF3C7" />
                  <text x="150" y="60" fontSize="14">💫</text>
                </svg>
              </div>
              <h2 className="empty-page-title">Your wishlist is empty</h2>
              <p className="empty-page-subtitle">Save the items you love here! Browse our collections and tap the heart icon to add products to your wishlist.</p>
              <div className="empty-page-actions">
                <Link to="/products" className="empty-cta-primary">
                  <FiTrash2 style={{ display: 'none' }} /> Explore Products
                </Link>
                <Link to="/products/Women" className="empty-cta-secondary">Women's</Link>
                <Link to="/products/Men" className="empty-cta-secondary">Men's</Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="wishlist-grid" style={{ padding: '24px 0' }}>
            {products.map((product) => (
              <div key={product._id} className="wishlist-card card">
                <Link to={`/product/${product._id}`} className="wl-img">
                  <img src={getProductImage(product.images?.[0], 'https://via.placeholder.com/200')} alt={product.name} />
                </Link>

                <div className="wl-info">
                  <p className="wl-brand">{product.brand}</p>
                  <Link to={`/product/${product._id}`}><h3>{product.name}</h3></Link>
                  <div className="wl-pricing">
                    <span className="wl-price">₹{product.price?.toLocaleString()}</span>
                    {product.originalPrice > product.price && (
                      <>
                        <span className="wl-original">₹{product.originalPrice?.toLocaleString()}</span>
                        <span className="wl-off">{product.discount || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off</span>
                      </>
                    )}
                  </div>
                  <div className="wl-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => { toast('Select size on product page'); }}>
                      <FiShoppingCart /> Add to Cart
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleWishlist(product._id)}>
                      <FiTrash2 /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
