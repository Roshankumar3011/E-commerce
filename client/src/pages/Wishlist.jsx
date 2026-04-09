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
          <div className="empty-state">
            <div className="empty-icon">❤️</div>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love to your wishlist</p>
            <Link to="/products" className="btn btn-primary">Explore Products</Link>
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
