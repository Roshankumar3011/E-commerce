import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiRefreshCw, FiShield, FiCreditCard, FiChevronLeft, FiChevronRight, FiSun, FiUser, FiHeart } from 'react-icons/fi';
import API from '../utils/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import summerHero from '../assets/hero-summer.png';
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
      title: "LUXURY SUMMER 24",
      subtitle: 'Exclusive AI-Designed Collection starting at ₹899',
      cta: 'Explore Collection',
      link: '/products',
      emoji: '🌞',
      image: summerHero,
      gradient: 'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 100%)',
      icon: <FiSun />,
    },
    {
      title: 'URBAN STREETWEAR',
      subtitle: 'The best of global brands now in Yellow',
      cta: 'Shop Men',
      link: '/products/Men',
      emoji: '👟',
      image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1600',
      gradient: 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)',
      icon: <FiUser />,
    },
    {
      title: 'ELEGANCE REDEFINED',
      subtitle: 'Exclusive discounts on luxury wear',
      cta: 'Shop Women',
      link: '/products/Women',
      emoji: '✨',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600',
      gradient: 'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 100%)',
      icon: <FiHeart />,
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  }, [bannerSlides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
    handleManualAction();
  };

  const handleManualAction = () => {
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  const features = [
    { icon: <FiTruck />, title: 'EXPRESS DELIVERY', desc: 'Arriving in 1-2 business days' },
    { icon: <FiRefreshCw />, title: 'REFUND POLICY', desc: 'Worry-free 7-day returns' },
    { icon: <FiShield />, title: 'AUTHENTICITY', desc: '100% verified genuine products' },
    { icon: <FiCreditCard />, title: 'EASY CHECKOUT', desc: 'UPI, Cards & Net Banking' },
  ];

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-banner">
        {bannerSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
            style={{ 
              backgroundImage: `${slide.gradient}, url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="container">
              <div className="hero-content">
                <div className="hero-icon stagger-in stagger-delay-1">{slide.icon}</div>
                <h1 className="stagger-in stagger-delay-2">{slide.title}</h1>
                <p className="stagger-in stagger-delay-3">{slide.subtitle}</p>
                <Link to={slide.link} className="btn btn-lg hero-cta stagger-in stagger-delay-4">
                  {slide.cta} <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        {/* Banner Navigation Arrows */}
        <button className="banner-nav prev" onClick={prevSlide}>
          <FiChevronLeft />
        </button>
        <button className="banner-nav next" onClick={() => { nextSlide(); handleManualAction(); }}>
          <FiChevronRight />
        </button>

        <div className="hero-dots">
          {bannerSlides.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => { setCurrentSlide(idx); handleManualAction(); }}
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
            <Loader />
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
            <div className="promo-card promo-men" style={{ 
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              <div className="promo-content">
                <h3>Men's Collection</h3>
                <p>Starting from ₹499</p>
                <Link to="/products/Men" className="btn btn-sm hero-cta">
                  Shop Now <FiArrowRight />
                </Link>
              </div>
            </div>
            <div className="promo-card promo-women" style={{ 
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              <div className="promo-content">
                <h3>Women's Stylings</h3>
                <p>Up to 60% off</p>
                <Link to="/products/Women" className="btn btn-sm hero-cta">
                  Shop Now <FiArrowRight />
                </Link>
              </div>
            </div>
            <div className="promo-card promo-kids" style={{ 
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              <div className="promo-content">
                <h3>Kids' Hub</h3>
                <p>Buy 2 Get 1 Free</p>
                <Link to="/products/Kids" className="btn btn-sm hero-cta">
                  Shop Now <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section arrivals-section">
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
