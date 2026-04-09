import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import API from '../utils/api';
import ProductCard from '../components/ProductCard';
import './Products.css';

const Products = () => {
  const { gender } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    size: searchParams.get('size') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || '-createdAt',
    search: searchParams.get('search') || '',
  });

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          API.get('/categories'),
          API.get('/products/meta/brands'),
        ]);
        setCategories(catRes.data.categories);
        setBrands(brandRes.data.brands);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: searchParams.get('search') || '' }));
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [gender, filters, searchParams]);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', '12');
      if (gender) params.set('gender', gender);
      if (filters.category) params.set('category', filters.category);
      if (filters.brand) params.set('brand', filters.brand);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.size) params.set('size', filters.size);
      if (filters.rating) params.set('rating', filters.rating);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.search) params.set('search', filters.search);

      const res = await API.get(`/products?${params}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '', brand: '', minPrice: '', maxPrice: '',
      size: '', rating: '', sort: '-createdAt', search: '',
    });
    setSearchParams({});
  };

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: '-ratings.average', label: 'Top Rated' },
    { value: '-discount', label: 'Best Discount' },
  ];

  const activeFiltersCount = Object.values(filters).filter((v) => v && v !== '-createdAt').length;

  return (
    <div className="products-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>{gender ? `${gender}'s Fashion` : filters.search ? `Results for "${filters.search}"` : 'All Products'}</h1>
          <p className="breadcrumb">Home / {gender || 'Products'} — {pagination.total} items found</p>
        </div>
      </div>

      <div className="container">
        <div className="products-layout">
          {/* Sidebar Filters */}
          <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
              <h3>Filters {activeFiltersCount > 0 && <span className="filter-count">{activeFiltersCount}</span>}</h3>
              <div className="filters-actions">
                {activeFiltersCount > 0 && (
                  <button className="clear-btn" onClick={clearFilters}>Clear All</button>
                )}
                <button className="close-filters" onClick={() => setShowFilters(false)}><FiX /></button>
              </div>
            </div>

            {/* Category */}
            <div className="filter-group">
              <h4>Category <FiChevronDown /></h4>
              <div className="filter-options">
                {categories.map((cat) => (
                  <label key={cat._id} className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === cat._id}
                      onChange={() => handleFilterChange('category', filters.category === cat._id ? '' : cat._id)}
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand */}
            <div className="filter-group">
              <h4>Brand <FiChevronDown /></h4>
              <div className="filter-options">
                {brands.map((brand) => (
                  <label key={brand} className="filter-option">
                    <input
                      type="radio"
                      name="brand"
                      checked={filters.brand === brand}
                      onChange={() => handleFilterChange('brand', filters.brand === brand ? '' : brand)}
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="filter-group">
              <h4>Price Range</h4>
              <div className="price-inputs">
                <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} />
                <span>to</span>
                <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} />
              </div>
            </div>

            {/* Size */}
            <div className="filter-group">
              <h4>Size</h4>
              <div className="size-options">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-filter-btn ${filters.size === size ? 'active' : ''}`}
                    onClick={() => handleFilterChange('size', filters.size === size ? '' : size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="filter-group">
              <h4>Customer Rating</h4>
              <div className="filter-options">
                {[4, 3, 2].map((r) => (
                  <label key={r} className="filter-option">
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.rating === String(r)}
                      onChange={() => handleFilterChange('rating', filters.rating === String(r) ? '' : String(r))}
                    />
                    <span>{r}★ & above</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="products-main">
            <div className="products-toolbar">
              <button className="filter-toggle-btn" onClick={() => setShowFilters(true)}>
                <FiFilter /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>

              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="sort-select"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="product-grid">
                {[...Array(8)].map((_, i) => (
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
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search query</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map((product) => (
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
