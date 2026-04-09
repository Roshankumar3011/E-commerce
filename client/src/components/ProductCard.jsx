import { Link } from 'react-router-dom';
import { FiHeart, FiStar } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const inWishlist = isInWishlist(product._id);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    toggleWishlist(product._id);
  };

  const discount = product.discount || (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0);

  return (
    <Link to={`/product/${product._id}`} className="product-card animate-fadeIn">
      <div className="product-img-wrap">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/300x400?text=No+Image'}
          alt={product.name}
          loading="lazy"
        />
        {discount > 0 && (
          <span className="discount-badge">-{discount}%</span>
        )}
        {user && (
          <button
            className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
            onClick={handleWishlist}
          >
            <FiHeart />
          </button>
        )}
        {product.totalStock <= 5 && product.totalStock > 0 && (
          <span className="low-stock-badge">Only {product.totalStock} left!</span>
        )}
        {product.totalStock === 0 && (
          <div className="out-of-stock-overlay">
            <span>Out of Stock</span>
          </div>
        )}
      </div>

      <div className="product-info">
        <p className="product-brand">{product.brand}</p>
        <h3 className="product-name">{product.name}</h3>

        <div className="product-pricing">
          <span className="current-price">₹{product.price?.toLocaleString()}</span>
          {product.originalPrice > product.price && (
            <>
              <span className="original-price">₹{product.originalPrice?.toLocaleString()}</span>
              <span className="discount-text">{discount}% off</span>
            </>
          )}
        </div>

        {product.ratings?.count > 0 && (
          <div className="product-rating">
            <span className="rating-badge">
              {product.ratings.average} <FiStar />
            </span>
            <span className="rating-count">({product.ratings.count})</span>
          </div>
        )}

        {product.sizes?.length > 0 && (
          <div className="product-sizes">
            {product.sizes.slice(0, 4).map((s) => (
              <span key={s.size} className="size-tag">{s.size}</span>
            ))}
            {product.sizes.length > 4 && <span className="size-tag">+{product.sizes.length - 4}</span>}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
