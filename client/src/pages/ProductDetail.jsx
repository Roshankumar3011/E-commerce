import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiTruck, FiRefreshCw, FiShield, FiChevronRight } from 'react-icons/fi';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const [prodRes, revRes] = await Promise.all([
          API.get(`/products/${id}`),
          API.get(`/reviews/product/${id}`),
        ]);
        setProduct(prodRes.data.product);
        setReviews(revRes.data.reviews);
        if (prodRes.data.product.colors?.length > 0) {
          setSelectedColor(prodRes.data.product.colors[0]);
        }
      } catch (err) {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login first');
      return navigate('/login');
    }
    if (!selectedSize) {
      return toast.error('Please select a size');
    }
    addToCart(product._id, selectedSize, selectedColor);
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error('Please login first');
      return navigate('/login');
    }
    if (!selectedSize) {
      return toast.error('Please select a size');
    }
    addToCart(product._id, selectedSize, selectedColor);
    navigate('/cart');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login first');
    try {
      const res = await API.post('/reviews', { productId: id, ...reviewForm });
      setReviews([res.data.review, ...reviews]);
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 16px' }}>
        <div className="detail-layout">
          <div className="skeleton" style={{ height: 500, borderRadius: 12 }} />
          <div>
            <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 28, width: '80%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 32, width: '30%', marginBottom: 24 }} />
            <div className="skeleton" style={{ height: 100, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 48, marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 48 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discount = product.discount || (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0);
  const inWishlist = isInWishlist(product._id);

  return (
    <div className="product-detail-page animate-fadeIn">
      <div className="container">
        {/* Breadcrumb */}
        <div className="detail-breadcrumb">
          <span onClick={() => navigate('/')}>Home</span>
          <FiChevronRight />
          <span onClick={() => navigate('/products')}>Products</span>
          <FiChevronRight />
          <span className="current">{product.name}</span>
        </div>

        <div className="detail-layout">
          {/* Image Gallery */}
          <div className="detail-gallery">
            <div className="gallery-thumbnails">
              {product.images?.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumb ${selectedImage === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} />
                </button>
              ))}
            </div>
            <div className="gallery-main">
              <img
                src={product.images?.[selectedImage] || 'https://via.placeholder.com/500'}
                alt={product.name}
              />
              {discount > 0 && <span className="detail-discount-badge">{discount}% OFF</span>}
            </div>
          </div>

          {/* Product Info */}
          <div className="detail-info">
            <p className="detail-brand">{product.brand}</p>
            <h1 className="detail-name">{product.name}</h1>

            {product.ratings?.count > 0 && (
              <div className="detail-rating">
                <span className="detail-rating-badge">
                  {product.ratings.average} <FiStar />
                </span>
                <span className="detail-rating-count">{product.ratings.count} Ratings & Reviews</span>
              </div>
            )}

            <div className="detail-pricing">
              <span className="detail-price">₹{product.price?.toLocaleString()}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="detail-original">₹{product.originalPrice?.toLocaleString()}</span>
                  <span className="detail-discount">{discount}% off</span>
                </>
              )}
            </div>

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div className="detail-section">
                <h3>Color: <span>{selectedColor?.name}</span></h3>
                <div className="color-options">
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      className={`color-btn ${selectedColor?.name === color.name ? 'active' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      style={{ background: color.hexCode }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div className="detail-section">
              <h3>Select Size</h3>
              <div className="size-options-detail">
                {product.sizes?.map((s) => (
                  <button
                    key={s.size}
                    className={`size-btn-detail ${selectedSize === s.size ? 'active' : ''} ${s.stock === 0 ? 'disabled' : ''}`}
                    onClick={() => s.stock > 0 && setSelectedSize(s.size)}
                    disabled={s.stock === 0}
                  >
                    {s.size}
                    {s.stock > 0 && s.stock <= 5 && <span className="stock-hint">{s.stock} left</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="detail-actions">
              <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                <FiShoppingCart /> Add to Cart
              </button>
              <button className="btn btn-secondary btn-lg" onClick={handleBuyNow}>
                ⚡ Buy Now
              </button>
            </div>

            {user && (
              <button
                className={`wishlist-toggle-btn ${inWishlist ? 'active' : ''}`}
                onClick={() => toggleWishlist(product._id)}
              >
                <FiHeart /> {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            )}

            {/* Delivery Features */}
            <div className="delivery-features">
              <div className="delivery-item">
                <FiTruck />
                <div>
                  <strong>Free Delivery</strong>
                  <span>On orders above ₹499</span>
                </div>
              </div>
              <div className="delivery-item">
                <FiRefreshCw />
                <div>
                  <strong>7 Days Return</strong>
                  <span>Easy return policy</span>
                </div>
              </div>
              <div className="delivery-item">
                <FiShield />
                <div>
                  <strong>Genuine Product</strong>
                  <span>100% authentic</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="detail-section">
              <h3>Product Description</h3>
              <p className="detail-description">{product.description}</p>
            </div>

            {/* Specifications */}
            {product.material && (
              <div className="detail-section">
                <h3>Specifications</h3>
                <table className="spec-table">
                  <tbody>
                    <tr><td>Material</td><td>{product.material}</td></tr>
                    <tr><td>Gender</td><td>{product.gender}</td></tr>
                    <tr><td>Brand</td><td>{product.brand}</td></tr>
                    {product.specifications?.map((spec, i) => (
                      <tr key={i}><td>{spec.key}</td><td>{spec.value}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <div className="reviews-header">
            <h2>Ratings & Reviews</h2>
            {user && (
              <button className="btn btn-outline btn-sm" onClick={() => setShowReviewForm(!showReviewForm)}>
                Write a Review
              </button>
            )}
          </div>

          {showReviewForm && (
            <form className="review-form animate-slideUp" onSubmit={handleSubmitReview}>
              <div className="input-group">
                <label>Rating</label>
                <div className="rating-select">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${reviewForm.rating >= star ? 'active' : ''}`}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label>Title</label>
                <input
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  placeholder="Summary of your review"
                />
              </div>
              <div className="input-group">
                <label>Comment</label>
                <textarea
                  rows={3}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience..."
                />
              </div>
              <button type="submit" className="btn btn-primary">Submit Review</button>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-top">
                    <span className="review-rating-badge">{review.rating} ★</span>
                    <strong>{review.title}</strong>
                  </div>
                  <p>{review.comment}</p>
                  <div className="review-meta">
                    <span>{review.user?.name}</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
