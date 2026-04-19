import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiStar, FiPlus } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getProductImage } from '../utils/assets';
import VariantDrawer from './VariantDrawer';
import toast from 'react-hot-toast';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [showDrawer, setShowDrawer] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const inWishlist = isInWishlist(product._id);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDrawer(true);
  };

  const handleConfirmAdd = (size, color) => {
    addToCart(product, size, color);
  };

  const discount = product.discount || (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0);

  return (
    <>
      <Link to={`/product/${product._id}`} className="product-card animate-fadeIn">
        <div className="product-img-wrap">
          <img
            src={getProductImage(product.images?.[0])}
            alt={product.name}
            loading="lazy"
          />

          <div className="img-overlay">
            <button className="quick-add-btn" onClick={handleQuickAdd}>
              <FiPlus /> Quick Add
            </button>
          </div>

          <button className="mobile-quick-add" onClick={handleQuickAdd} aria-label="Quick Add">
            <FiPlus />
          </button>

          {discount > 0 && (
            <span className="discount-badge">-{discount}% OFF</span>
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
            <span className="low-stock-badge">Only {product.totalStock} Left</span>
          )}
        </div>

        <div className="product-info">
          <div className="product-meta">
            {product.ratings?.count > 0 && (
              <div className="product-rating">
                {product.ratings.average} <FiStar className="star-icon" />
              </div>
            )}
          </div>
          <h3 className="product-name">{product.name}</h3>

          <div className="product-pricing">
            <span className="current-price">₹{product.price?.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <span className="original-price">₹{product.originalPrice?.toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>

      <VariantDrawer 
        isOpen={showDrawer} 
        onClose={() => setShowDrawer(false)} 
        product={product} 
        onConfirm={handleConfirmAdd} 
      />
    </>
  );
};

export default ProductCard;
