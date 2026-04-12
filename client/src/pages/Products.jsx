import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FiFilter, FiX } from 'react-icons/fi';
import API from '../utils/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import './Products.css';

const Products = () => {
  const { gender } = useParams();   // e.g. "Men" | "Women" | "Kids" | undefined
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);

  // Full category tree (all categories from DB)
  const [allCategories, setAllCategories] = useState([]);
  // Only the categories that have at least one product for the current gender
  const [scopedCategories, setScopedCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    size: '',
    rating: '',
    sort: '-createdAt',
    search: searchParams.get('search') || '',
  });

  // ── Sync search param changes (from navbar search) ────────────
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: searchParams.get('search') || '' }));
  }, [searchParams]);

  // ── Reset category & brand filters when gender route changes ──
  useEffect(() => {
    setFilters(prev => ({ ...prev, category: '', brand: '' }));
  }, [gender]);

  // ── Fetch metadata (categories + brands) scoped to gender ─────
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const q = gender ? `?gender=${gender}` : '';
        const [allCatRes, scopedRes, brandRes] = await Promise.all([
          API.get('/categories'),                           // full tree for hierarchy lookup
          API.get(`/products/meta/categories${q}`),        // only cats with products in this gender
          API.get(`/products/meta/brands${q}`),
        ]);
        setAllCategories(allCatRes.data.categories || []);
        setScopedCategories(scopedRes.data.categories || []);
        setBrands(brandRes.data.brands || []);
      } catch (err) {
        console.error('Meta fetch error:', err);
      }
    };
    fetchMeta();
  }, [gender]);

  // ── Build the visible category list for the sidebar ───────────
  /**
   * A category is shown when:
   *  - No gender route   → all categories EXCEPT root gender nodes
   *  - Gender route set  →
   *      a) it is a direct child of the current gender root (hierarchy)
   *      b) OR it has at least one product for this gender (product-driven)
   *
   * We use .toString() for ObjectId comparison (MongoDB IDs are objects, not strings).
   */
  const visibleCategories = allCategories.filter(cat => {
    if (!gender) {
      // All-products page: hide root gender categories themselves
      return !['Men', 'Women', 'Kids'].includes(cat.name);
    }

    // Find the root category matching the current gender (no parent = root)
    const genderRoot = allCategories.find(
      c => c.name === gender && !c.parent
    );

    // Hierarchy check: cat.parent (populated object or bare ID) matches the gender root
    const parentId =
      cat.parent?._id?.toString() ||   // populated parent object
      cat.parent?.toString();           // bare ObjectId
    const isHierarchyChild =
      genderRoot && parentId && parentId === genderRoot._id.toString();

    // Product-driven check: this cat exists in the scoped (gender-filtered) list
    const hasProducts = scopedCategories.some(
      sc => sc._id.toString() === cat._id.toString()
    );

    return isHierarchyChild || hasProducts;
  });

  // ── Fetch products ────────────────────────────────────────────
  const fetchProducts = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', '12');
      if (gender)          params.set('gender', gender);
      if (filters.category) params.set('category', filters.category);
      if (filters.brand)    params.set('brand', filters.brand);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.size)     params.set('size', filters.size);
      if (filters.rating)   params.set('rating', filters.rating);
      if (filters.sort)     params.set('sort', filters.sort);
      if (filters.search)   params.set('search', filters.search);

      const res = await API.get(`/products?${params}`);
      // Safety: drop products with no images
      const valid = (res.data.products || []).filter(p => p.images?.length > 0);
      setProducts(valid);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Products fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [gender, filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFilterChange = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const clearFilters = () => {
    setFilters({
      category: '', brand: '', minPrice: '', maxPrice: '',
      size: '', rating: '', sort: '-createdAt', search: '',
    });
    setSearchParams({});
  };

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const sortOptions = [
    { value: '-createdAt',        label: 'Newest First' },
    { value: 'price',             label: 'Price: Low to High' },
    { value: '-price',            label: 'Price: High to Low' },
    { value: '-ratings.average',  label: 'Top Rated' },
    { value: '-discount',         label: 'Best Discount' },
  ];

  const activeFiltersCount = Object.values(filters).filter(
    v => v && v !== '-createdAt'
  ).length;

  return (
    <div className="products-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>
            {filters.category
              ? allCategories.find(c => c._id === filters.category)?.name || 'Products'
              : gender
              ? `${gender === 'Kids' ? "Kids'" : `${gender}'s`} Fashion`
              : filters.search
              ? `Results for "${filters.search}"`
              : 'All Products'}
          </h1>
          <p className="breadcrumb">
            <Link to="/">Home</Link> /{' '}
            {gender ? (
              <>
                <Link to="/products">Products</Link> /{' '}
                <Link to={`/products/${gender}`}>{gender}</Link>
              </>
            ) : (
              <Link to="/products">Products</Link>
            )}
            {filters.category && (
              <>
                {' / '}
                <span className="active-crumb">
                  {allCategories.find(c => c._id === filters.category)?.name || ''}
                </span>
              </>
            )}
            <span style={{ opacity: 0.7, marginLeft: '6px' }}>— {pagination.total} items found</span>
          </p>
        </div>
      </div>

      <div className="container">
        <div className="products-layout">

          {/* ── SIDEBAR FILTERS ─────────────────────────── */}
          <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
              <h3>
                Filters{' '}
                {activeFiltersCount > 0 && (
                  <span className="filter-count">{activeFiltersCount}</span>
                )}
              </h3>
              <div className="filters-actions">
                {activeFiltersCount > 0 && (
                  <button className="clear-btn" onClick={clearFilters}>
                    Clear All
                  </button>
                )}
                <button
                  className="close-filters"
                  onClick={() => setShowFilters(false)}
                >
                  <FiX />
                </button>
              </div>
            </div>

            {/* Gender switcher — only on the All Products page */}
            {!gender && (
              <div className="filter-group">
                <h4>Gender</h4>
                <div className="filter-options">
                  {['Men', 'Women', 'Kids'].map(g => (
                    <label key={g} className="filter-option">
                      <input
                        type="radio"
                        name="gender_select"
                        checked={false}
                        onChange={() => navigate(`/products/${g}`)}
                      />
                      <span>{g}</span>
                    </label>
                  ))}
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="gender_select"
                      checked={!gender}
                      onChange={() => navigate('/products')}
                      readOnly
                    />
                    <span>All</span>
                  </label>
                </div>
              </div>
            )}

            {/* ── DYNAMIC CATEGORY LIST ─────────────────── */}
            <div className="filter-group">
              <h4>Category</h4>
              <div className="filter-options">
                {visibleCategories.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '4px 0' }}>
                    No categories available
                  </p>
                ) : (
                  visibleCategories.map(cat => (
                    <label
                      key={cat._id}
                      className={`filter-option ${cat.parent ? 'is-child' : ''}`}
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === cat._id}
                        onChange={() =>
                          handleFilterChange(
                            'category',
                            filters.category === cat._id ? '' : cat._id
                          )
                        }
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Brand */}
            <div className="filter-group">
              <h4>Brand</h4>
              <div className="filter-options">
                {brands.map(brand => (
                  <label key={brand} className="filter-option">
                    <input
                      type="radio"
                      name="brand"
                      checked={filters.brand === brand}
                      onChange={() =>
                        handleFilterChange(
                          'brand',
                          filters.brand === brand ? '' : brand
                        )
                      }
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <h4>Price Range</h4>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={e => handleFilterChange('minPrice', e.target.value)}
                />
                <span>–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={e => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            {/* Size */}
            <div className="filter-group">
              <h4>Size</h4>
              <div className="size-options">
                {sizes.map(size => (
                  <button
                    key={size}
                    className={`size-filter-btn ${filters.size === size ? 'active' : ''}`}
                    onClick={() =>
                      handleFilterChange('size', filters.size === size ? '' : size)
                    }
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── PRODUCT GRID ─────────────────────────────── */}
          <div className="products-main">
            <div className="products-toolbar">
              <button
                className="filter-toggle-btn"
                onClick={() => setShowFilters(true)}
              >
                <FiFilter /> Filters{' '}
                {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>

              <select
                value={filters.sort}
                onChange={e => handleFilterChange('sort', e.target.value)}
                className="sort-select"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <Loader />
            ) : products.length === 0 ? (
              <div className="empty-page-container">
                <div className="empty-page-inner">
                  <div className="empty-page-illustration">
                    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="100" cy="100" r="90" fill="#F0FDF4" />
                      <circle cx="92" cy="90" r="38" stroke="#86EFAC" strokeWidth="8" fill="white"/>
                      <line x1="120" y1="118" x2="148" y2="148" stroke="#86EFAC" strokeWidth="8" strokeLinecap="round"/>
                      <circle cx="92" cy="90" r="26" fill="#DCFCE7"/>
                      <line x1="82" y1="90" x2="102" y2="90" stroke="#4ADE80" strokeWidth="4" strokeLinecap="round"/>
                      <line x1="92" y1="80" x2="92" y2="100" stroke="#4ADE80" strokeWidth="4" strokeLinecap="round"/>
                      <circle cx="155" cy="50" r="14" fill="#FEF9C3"/>
                      <text x="150" y="55" fontSize="14">🔍</text>
                    </svg>
                  </div>
                  <h2 className="empty-page-title">No products found</h2>
                  <p className="empty-page-subtitle">We couldn't find any products matching your search or filters. Try a different query or explore our popular categories.</p>
                  <div className="empty-page-actions">
                    <button className="empty-cta-primary" onClick={clearFilters}>Clear All Filters</button>
                    <button className="empty-cta-secondary" onClick={() => navigate('/products/Men')}>Men's</button>
                    <button className="empty-cta-secondary" onClick={() => navigate('/products/Women')}>Women's</button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <div className="pagination">
                    {Array.from({ length: pagination.pages }, (_, i) => (
                      <button
                        key={i}
                        className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`}
                        onClick={() => fetchProducts(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
