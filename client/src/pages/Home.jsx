import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiUser, FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import API from '../utils/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import './Home.css';

// Local Sub-component with Vertical Sidebar Filters (Reference Based)
const ProductSection = ({ title, viewAllLink, collections, selectedTag, onTagChange, products, loading, scrollRef, onScroll }) => (
  <section className="section">
    <div className="container">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <Link to={viewAllLink} className="view-all">
          View All <FiArrowRight />
        </Link>
      </div>

      <div className="section-body">
        <aside className="section-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">Filters</span>
            {selectedTag && <span className="sidebar-badge">1</span>}
          </div>
          
          <div className="sidebar-group">
            <label className="group-label">CATEGORY</label>
            <div className="filter-list-vertical">
              {collections.map((col) => (
                <button
                  key={col.name}
                  className={`filter-item-v ${selectedTag === col.value ? 'active' : ''}`}
                  onClick={() => onTagChange(col.value)}
                >
                  <span className="radio-circle"></span>
                  <span className="filter-name">{col.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="section-content" style={{ opacity: loading ? 0.4 : 1, pointerEvents: loading ? 'none' : 'auto', transition: 'all 0.3s ease' }}>
          <div className="scroll-row-container">
            <button className="scroll-nav-btn prev" onClick={() => onScroll('left')} aria-label="Previous">
              <FiChevronLeft />
            </button>
            <div className="scroll-row" ref={scrollRef}>
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="no-products">No products found.</div>
              )}
            </div>
            <button className="scroll-nav-btn next" onClick={() => onScroll('right')} aria-label="Next">
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Home = () => {
  // Top Deals State
  const [deals, setDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [selectedDealsTag, setSelectedDealsTag] = useState('');
  const dealsScrollRef = useRef(null);

  // Men's Collection State
  const [menProducts, setMenProducts] = useState([]);
  const [menLoading, setMenLoading] = useState(true);
  const [selectedMenTag, setSelectedMenTag] = useState('');
  const menScrollRef = useRef(null);

  // Women's Collection State
  const [womenProducts, setWomenProducts] = useState([]);
  const [womenLoading, setWomenLoading] = useState(true);
  const [selectedWomenTag, setSelectedWomenTag] = useState('');
  const womenScrollRef = useRef(null);

  // Kids' Collection State
  const [kidsProducts, setKidsProducts] = useState([]);
  const [kidsLoading, setKidsLoading] = useState(true);
  const [selectedKidsTag, setSelectedKidsTag] = useState('');
  const kidsScrollRef = useRef(null);

  const [dealCollections, setDealCollections] = useState([{ name: 'All', value: '' }]);
  const [menCollections, setMenCollections] = useState([{ name: 'All', value: '' }]);
  const [womenCollections, setWomenCollections] = useState([{ name: 'All', value: '' }]);
  const [kidsCollections, setKidsCollections] = useState([{ name: 'All', value: '' }]);

  useEffect(() => {
    API.get('/products/meta/seasons').then(res => {
      // Filter out "All Season" from the backend response as requested
      const activeSeasons = res.data.seasons.filter(s => s !== 'All Season');
      setDealCollections([{ name: 'All', value: '' }, ...activeSeasons.map(s => ({ name: s, value: s }))]);
    });
    API.get('/products/meta/categories?gender=Men').then(res => {
      setMenCollections([{ name: 'All', value: '' }, ...res.data.categories.map(c => ({ name: c.name, value: c._id }))]);
    });
    API.get('/products/meta/categories?gender=Women').then(res => {
      setWomenCollections([{ name: 'All', value: '' }, ...res.data.categories.map(c => ({ name: c.name, value: c._id }))]);
    });
    API.get('/products/meta/categories?gender=Kids').then(res => {
      setKidsCollections([{ name: 'All', value: '' }, ...res.data.categories.map(c => ({ name: c.name, value: c._id }))]);
    });
  }, []);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 600;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // Generic fetcher
  const fetchData = async (setter, loadingSetter, filters = {}) => {
    loadingSetter(true);
    try {
      let url = `/products?limit=10`;
      if (filters.sort) url += `&sort=${filters.sort}`;
      if (filters.gender) url += `&gender=${filters.gender}`;
      if (filters.category) url += `&category=${filters.category}`;
      if (filters.season) url += `&season=${filters.season}`;
      if (filters.isPinnedTopDeals) url += `&isPinnedTopDeals=${filters.isPinnedTopDeals}`;
      const res = await API.get(url);
      setter(res.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      loadingSetter(false);
    }
  };

  useEffect(() => { fetchData(setDeals, setDealsLoading, { sort: '-ratings.average', season: selectedDealsTag, isPinnedTopDeals: true }); }, [selectedDealsTag]);
  useEffect(() => { fetchData(setMenProducts, setMenLoading, { gender: 'Men', category: selectedMenTag }); }, [selectedMenTag]);
  useEffect(() => { fetchData(setWomenProducts, setWomenLoading, { gender: 'Women', category: selectedWomenTag }); }, [selectedWomenTag]);
  useEffect(() => { fetchData(setKidsProducts, setKidsLoading, { gender: 'Kids', category: selectedKidsTag }); }, [selectedKidsTag]);

  const [initialLoading, setInitialLoading] = useState(true);

  // Global loader tracking logic
  useEffect(() => {
    // Only remove initial loader once all primary sections fetch for the first time
    if (!dealsLoading && !menLoading && !womenLoading && !kidsLoading) {
      setInitialLoading(false);
    }
  }, [dealsLoading, menLoading, womenLoading, kidsLoading]);

  // Promotional Offers State
  const [activeOffer, setActiveOffer] = useState(0);
  const offers = [
    { id: 1, text: "BUY 1 GET 1 FREE", subtext: "On Bestsellers", color: "linear-gradient(135deg, #6366f1, #a855f7)" },
    { id: 2, text: "FLAT ₹500 OFF", subtext: "On orders above ₹1499", color: "linear-gradient(135deg, #f43f5e, #fb923c)" },
    { id: 3, text: "EXTRA 10% OFF", subtext: "For VIP Members", color: "linear-gradient(135deg, #06b6d4, #0ea5e9)" },
    { id: 4, text: "FREE SHIPPING", subtext: "On Prepaid Orders", color: "linear-gradient(135deg, #10b981, #3b82f6)" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveOffer((prev) => (prev + 1) % offers.length);
    }, 5000); // 5 seconds for slower auto-slide
    return () => clearInterval(timer);
  }, [offers.length]);

  if (initialLoading) {
    return (
      <div className="home-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className="home-page">
      <ProductSection 
        title="Top Deals" 
        viewAllLink="/products" 
        collections={dealCollections} 
        selectedTag={selectedDealsTag} 
        onTagChange={setSelectedDealsTag} 
        products={deals} 
        loading={dealsLoading} 
        scrollRef={dealsScrollRef} 
        onScroll={(dir) => scroll(dealsScrollRef, dir)} 
      />

      <ProductSection 
        title="Men's Collection" 
        viewAllLink="/products/Men" 
        collections={menCollections} 
        selectedTag={selectedMenTag} 
        onTagChange={setSelectedMenTag} 
        products={menProducts} 
        loading={menLoading} 
        scrollRef={menScrollRef} 
        onScroll={(dir) => scroll(menScrollRef, dir)} 
      />

      <ProductSection 
        title="Women's Collection" 
        viewAllLink="/products/Women" 
        collections={womenCollections} 
        selectedTag={selectedWomenTag} 
        onTagChange={setSelectedWomenTag} 
        products={womenProducts} 
        loading={womenLoading} 
        scrollRef={womenScrollRef} 
        onScroll={(dir) => scroll(womenScrollRef, dir)} 
      />

      <ProductSection 
        title="Kids' Collection" 
        viewAllLink="/products/Kids" 
        collections={kidsCollections} 
        selectedTag={selectedKidsTag} 
        onTagChange={setSelectedKidsTag} 
        products={kidsProducts} 
        loading={kidsLoading} 
        scrollRef={kidsScrollRef} 
        onScroll={(dir) => scroll(kidsScrollRef, dir)} 
      />
      {/* Promotional Offers Slider (Hyper-Density) */}
      <section className="section offers-section">
        <div className="container">
          <div className="offer-slider-container">
            <div 
              className="offer-track" 
              style={{ transform: `translateX(-${activeOffer * 100}%)` }}
            >
              {offers.map((offer) => (
                <div key={offer.id} className="offer-card slider" style={{ background: offer.color }}>
                  <div className="offer-badge">LIMITED TIME</div>
                  <div className="offer-content">
                    <h3 className="offer-text">{offer.text}</h3>
                    <p className="offer-subtext">{offer.subtext}</p>
                  </div>
                  <FiArrowRight className="offer-arrow" />
                </div>
              ))}
            </div>
            {/* Pagination Dots */}
            <div className="offer-dots">
              {offers.map((_, i) => (
                <span key={i} className={`offer-dot ${activeOffer === i ? 'active' : ''}`}></span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
