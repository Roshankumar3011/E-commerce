import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiRefreshCw, FiShield, FiCreditCard } from 'react-icons/fi';
import API from '../utils/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get('/products?limit=12&sort=-ratings.average');
        setProducts(res.data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const bannerSlides = [
    {
      title: "Summer Collection '24",
      subtitle: 'Up to 70% off on trending styles',
      cta: 'Shop Now',
      link: '/products',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      emoji: '☀️',
    },
    {
      title: 'Men\'s Fashion',
      subtitle: 'Premium brands at unbeatable prices',
      cta: 'Explore Men',
      link: '/products/Men',
      gradient: 'linear-gradient(135deg, #2874f0 0%, #0d47a1 100%)',
      emoji: '👔',
    },
    {
      title: 'Women\'s Collection',
      subtitle: 'Elegant styles for every occasion',
      cta: 'Shop Women',
      link: '/products/Women',
      gradient: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)',
      emoji: '👗',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { name: 'Men', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', color: '#e3f2fd' },
    { name: 'Women', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop', color: '#fce4ec' },
    { name: 'Kids', image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=200&h=200&fit=crop', color: '#fff3e0' },
  ];

  const features = [
    { icon: <FiTruck />, title: 'Free Shipping', desc: 'On orders above ₹499' },
    { icon: <FiRefreshCw />, title: 'Easy Returns', desc: '7-day return policy' },
    { icon: <FiShield />, title: 'Secure Payment', desc: '100% secure checkout' },
    { icon: <FiCreditCard />, title: 'COD Available', desc: 'Cash on delivery' },
  ];

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-banner">
        {bannerSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
            style={{ background: slide.gradient }}
          >
            <div className="container">
              <div className="hero-content">
                <span className="hero-emoji">{slide.emoji}</span>
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <Link to={slide.link} className="btn btn-lg hero-cta">
                  {slide.cta} <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        ))}
        <div className="hero-dots">
          {bannerSlides.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
      </section>

      {/* Features Strip */}
      <section className="features-strip">
        <div className="container">
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-item">
                <div className="feature-icon">{f.icon}</div>
                <div>
                  <strong>{f.title}</strong>
                  <span>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Circles */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="category-circles">
            {categories.map((cat) => (
              <Link to={`/products/${cat.name}`} key={cat.name} className="category-circle">
                <div className="cat-img-wrap" style={{ background: cat.color }}>
                  <img src={cat.image} alt={cat.name} />
                </div>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Deals */}
      <section className="section deals-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Top Deals 🔥</h2>
            <Link to="/products" className="view-all">
              View All <FiArrowRight />
            </Link>
          </div>
          {loading ? (
            <div className="product-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton" style={{ height: 280 }} />
                  <div style={{ padding: 14 }}>
                    <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 16, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="promo-section">
        <div className="container">
          <div className="promo-grid">
            <div className="promo-card promo-men" style={{ background: 'linear-gradient(135deg, #1a237e, #283593)' }}>
              <div className="promo-content">
                <h3>Men's Fashion</h3>
                <p>Starting from ₹499</p>
                <Link to="/products/Men" className="btn btn-sm" style={{ background: 'white', color: '#1a237e' }}>
                  Shop Now <FiArrowRight />
                </Link>
              </div>
            </div>
            <div className="promo-card promo-women" style={{ background: 'linear-gradient(135deg, #880e4f, #ad1457)' }}>
              <div className="promo-content">
                <h3>Women's Collection</h3>
                <p>Up to 60% off</p>
                <Link to="/products/Women" className="btn btn-sm" style={{ background: 'white', color: '#880e4f' }}>
                  Shop Now <FiArrowRight />
                </Link>
              </div>
            </div>
            <div className="promo-card promo-kids" style={{ background: 'linear-gradient(135deg, #e65100, #f57c00)' }}>
              <div className="promo-content">
                <h3>Kids' Wear</h3>
                <p>Buy 2 Get 1 Free</p>
                <Link to="/products/Kids" className="btn btn-sm" style={{ background: 'white', color: '#e65100' }}>
                  Shop Now <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">New Arrivals ✨</h2>
            <Link to="/products?sort=-createdAt" className="view-all">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="product-grid">
            {products.slice(4, 12).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
