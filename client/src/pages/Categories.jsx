import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiGrid, FiTag, FiLayers, FiShoppingBag, FiPackage, FiFeather } from 'react-icons/fi';
import API from '../utils/api';
import Loader from '../components/Loader';
import './Categories.css';

const CATEGORY_ICONS = {
  'tshirt': <FiFeather />, 'shirt': <FiLayers />, 'coat': <FiPackage />, 'jacket': <FiPackage />,
  'dress': <FiTag />, 'kurti': <FiTag />, 'saree': <FiLayers />, 'jeans': <FiTag />,
  'sweater': <FiLayers />, 'default': <FiTag />,
};

const getCategoryIcon = (name) => {
  const lower = name.toLowerCase();
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (lower.includes(key)) return CATEGORY_ICONS[key];
  }
  return CATEGORY_ICONS.default;
};

const GENDER_GRADIENTS = {
  Men: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  Women: 'linear-gradient(135deg, #ec4899, #be185d)',
  Kids: 'linear-gradient(135deg, #10b981, #047857)',
};

const Categories = () => {
  const [scopedCategories, setScopedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGender, setActiveGender] = useState('Men');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/products/meta/categories?gender=${activeGender}`);
        setScopedCategories(res.data.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [activeGender]);

  const genders = ['Men', 'Women', 'Kids'];
  const gradient = GENDER_GRADIENTS[activeGender];

  return (
    <div className="categories-page animate-fadeIn">
      {/* Gender Pills */}
      <div className="gender-pills-container">
        <div className="gender-pills">
          {genders.map(g => (
            <button
              key={g}
              className={`gender-pill ${activeGender === g ? 'active' : ''}`}
              style={activeGender === g ? { background: GENDER_GRADIENTS[g], borderColor: 'transparent' } : {}}
              onClick={() => setActiveGender(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Banner */}
      <div className="container">
        <div className="category-featured-banner" style={{ background: gradient }}>
          <div className="banner-text">
            <h2>Shop {activeGender}'s Fashion</h2>
            <p>Explore {scopedCategories.length} categories for {activeGender}</p>
          </div>
          <Link to={`/products/${activeGender}`} className="banner-link">
            View All <FiChevronRight />
          </Link>
        </div>

        {/* Category Cards */}
        {loading ? (
          <Loader />
        ) : scopedCategories.length > 0 ? (
          <div className="category-grid">
            {/* "All" card */}
            <Link to={`/products/${activeGender}`} className="category-card all-card" style={{ background: gradient }}>
              <div className="category-card-inner">
                <span className="cat-icon"><FiShoppingBag /></span>
                <h3>All {activeGender}</h3>
                <div className="explore-badge">Browse All <FiChevronRight /></div>
              </div>
            </Link>

            {scopedCategories.map(cat => (
              <Link
                key={cat._id}
                to={`/products/${activeGender}?category=${cat._id}`}
                className="category-card"
              >
                {cat.image ? (
                  <div className="category-card-img-wrap">
                    <img src={cat.image} alt={cat.name} className="category-card-img" />
                    <div className="category-card-overlay">
                      <h3>{cat.name}</h3>
                      <div className="explore-badge">Explore <FiChevronRight /></div>
                    </div>
                  </div>
                ) : (
                  <div className="category-card-inner" style={{ background: '#f8fafc' }}>
                    <span className="cat-icon">{getCategoryIcon(cat.name)}</span>
                    <h3 style={{ color: '#1e293b' }}>{cat.name}</h3>
                    <div className="explore-badge" style={{ color: '#64748b', background: '#e2e8f0' }}>
                      Explore <FiChevronRight />
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-subcats">
            <FiGrid size={48} opacity={0.2} />
            <p>No categories available yet for {activeGender}.</p>
            <Link to={`/products/${activeGender}`} className="btn btn-primary">
              View All {activeGender} Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
