import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiGrid } from 'react-icons/fi';
import API from '../utils/api';
import Loader from '../components/Loader';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGender, setActiveGender] = useState('Men');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories');
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const genders = ['Men', 'Women', 'Kids'];
  
  // Filter categories for the active gender
  // (Categories whose parent has the name of the active gender)
  const genderRoot = categories.find(c => c.name === activeGender && !c.parent);
  const subCategories = categories.filter(c => 
    c.parent && 
    (c.parent._id === genderRoot?._id || c.parent === genderRoot?._id)
  );

  if (loading) return <Loader />;

  return (
    <div className="categories-page animate-fadeIn">
      <div className="page-header">
        <div className="container">
          <h1>Shop by Category</h1>
          <p>Find your style across our collections</p>
        </div>
      </div>

      <div className="container">
        <div className="categories-layout">
          {/* Gender Selector (Left sidebar on desktop, Tabs on mobile) */}
          <div className="gender-tabs">
            {genders.map(g => (
              <button 
                key={g} 
                className={`gender-tab ${activeGender === g ? 'active' : ''}`}
                onClick={() => setActiveGender(g)}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="category-content">
            <div className="category-grid">
              {subCategories.length > 0 ? (
                subCategories.map(cat => (
                  <Link 
                    key={cat._id} 
                    to={`/products/${activeGender}?category=${cat._id}`}
                    className="category-explore-item card"
                  >
                    <div className="category-info">
                      <h3>{cat.name}</h3>
                      <p>Explore {cat.name} Collection</p>
                    </div>
                    <div className="category-icon-bg">
                      <FiChevronRight />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="no-subcats">
                  <FiGrid size={48} opacity={0.2} />
                  <p>Check back soon for new arrivals!</p>
                  <Link to={`/products/${activeGender}`} className="btn btn-primary btn-sm">
                    View All {activeGender} Products
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
