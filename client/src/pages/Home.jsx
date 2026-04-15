import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiUser, FiHeart, FiChevronLeft, FiChevronRight, FiFilter, FiX } from 'react-icons/fi';
import API from '../utils/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { useSettings } from '../context/SettingsContext';
import './Home.css';

// Local Sub-component with themed section headers
const ProductSection = ({ title, viewAllLink, collections, selectedTag, onTagChange, products, loading, scrollRef, onScroll, theme }) => {
  return (
    <section className={`section theme-${theme}`}>
      <div className="container">
        {/* Line 1: Title only */}
        <div className="section-title-row">
          <h2 className="section-title">{title}</h2>
        </div>

        {/* Line 2: Pills + View All */}
        <div className="section-pills-row">
          <div className="home-category-pills">
            {collections.map((col) => (
              <button
                key={col.name}
                className={`home-pill ${selectedTag === col.value ? 'active' : ''}`}
                onClick={() => onTagChange(col.value)}
              >
                {col.name}
              </button>
            ))}
          </div>
          <Link to={viewAllLink} className="view-all">
            View All <FiArrowRight />
          </Link>
        </div>

        <div className="section-body">
          <button className="scroll-nav-btn prev" onClick={() => onScroll('left')} aria-label="Previous">
            <FiChevronLeft />
          </button>

          <div className="section-content" style={{ opacity: loading ? 0.4 : 1, pointerEvents: loading ? 'none' : 'auto', transition: 'all 0.3s ease' }}>
            <div className="scroll-row-container">
              <div className="scroll-row" ref={scrollRef}>
                {products.length > 0 ? (
                  products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))
                ) : (
                  <div className="no-products">No products found.</div>
                )}
              </div>
            </div>
          </div>

          <button className="scroll-nav-btn next" onClick={() => onScroll('right')} aria-label="Next">
            <FiChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const { settings } = useSettings();
  
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
      const scrollAmount = ref.current.clientWidth;
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
  const banners = settings?.banners?.length ? settings.banners : [];

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveOffer((prev) => (prev + 1) % banners.length);
    }, 5000); // 5 seconds for slower auto-slide
    return () => clearInterval(timer);
  }, [banners.length]);

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
        theme="gold"
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
        theme="blue"
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
        theme="pink"
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
        theme="green"
        collections={kidsCollections}
        selectedTag={selectedKidsTag}
        onTagChange={setSelectedKidsTag}
        products={kidsProducts}
        loading={kidsLoading}
        scrollRef={kidsScrollRef}
        onScroll={(dir) => scroll(kidsScrollRef, dir)}
      />
      {/* Promotional Offers Slider (Hyper-Density) */}
      {banners.length > 0 && (
        <section className="section offers-section">
          <div className="container">
            <div className="offer-slider-container">
              <div
                className="offer-track"
                style={{ transform: `translateX(-${activeOffer * 100}%)` }}
              >
                {banners.map((banner, i) => (
                  <div key={i} className="offer-card slider" style={{
                    background: banner.image ? `url(${banner.image}) center/cover no-repeat` : banner.color || 'var(--primary)',
                    color: 'white'
                  }}>
                    <div className="img-overlay" style={{ background: banner.image ? 'rgba(0,0,0,0.4)' : 'transparent', zIndex: 1 }}></div>
                    <div className="offer-badge" style={{ zIndex: 2 }}>LIMITED TIME</div>
                    <div className="offer-content" style={{ zIndex: 2 }}>
                      <h3 className="offer-text">{banner.text}</h3>
                      <p className="offer-subtext">{banner.subtext}</p>
                    </div>
                    <FiArrowRight className="offer-arrow" style={{ zIndex: 2 }} />
                  </div>
                ))}
              </div>
              {/* Pagination Dots */}
              {banners.length > 1 && (
                <div className="offer-dots">
                  {banners.map((_, i) => (
                    <span key={i} className={`offer-dot ${activeOffer === i ? 'active' : ''}`}></span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
