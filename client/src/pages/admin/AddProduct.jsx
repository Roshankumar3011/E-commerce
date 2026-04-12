import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiX, FiStar, FiTag } from 'react-icons/fi';
import { AdminLayout } from './Dashboard';
import API from '../../utils/api';
import { getProductImage } from '../../utils/assets';
import toast from 'react-hot-toast';
import './Admin.css';

// Full curated color palette with name + hex
const COLOR_PALETTE = [
  { name: 'Black', hexCode: '#000000' },
  { name: 'White', hexCode: '#FFFFFF' },
  { name: 'Navy Blue', hexCode: '#1B2A6B' },
  { name: 'Royal Blue', hexCode: '#2563EB' },
  { name: 'Sky Blue', hexCode: '#38BDF8' },
  { name: 'Teal', hexCode: '#0D9488' },
  { name: 'Olive Green', hexCode: '#4A5E23' },
  { name: 'Forest Green', hexCode: '#15803D' },
  { name: 'Mint Green', hexCode: '#6EE7B7' },
  { name: 'Red', hexCode: '#DC2626' },
  { name: 'Maroon', hexCode: '#7F1D1D' },
  { name: 'Coral', hexCode: '#F87171' },
  { name: 'Orange', hexCode: '#F97316' },
  { name: 'Yellow', hexCode: '#FACC15' },
  { name: 'Mustard', hexCode: '#CA8A04' },
  { name: 'Pink', hexCode: '#EC4899' },
  { name: 'Hot Pink', hexCode: '#DB2777' },
  { name: 'Lavender', hexCode: '#A78BFA' },
  { name: 'Purple', hexCode: '#7C3AED' },
  { name: 'Charcoal', hexCode: '#374151' },
  { name: 'Grey', hexCode: '#9CA3AF' },
  { name: 'Light Grey', hexCode: '#E5E7EB' },
  { name: 'Beige', hexCode: '#D4B483' },
  { name: 'Cream', hexCode: '#FEF3C7' },
  { name: 'Brown', hexCode: '#92400E' },
  { name: 'Camel', hexCode: '#C8A96E' },
  { name: 'Khaki', hexCode: '#A8A458' },
  { name: 'Off White', hexCode: '#FAF9F6' },
  { name: 'Indigo', hexCode: '#4338CA' },
  { name: 'Gold', hexCode: '#D4AC0D' },
];

// Color typeahead input component
const ColorInput = ({ color, idx, onColorChange, onRemove, showRemove }) => {
  const [query, setQuery] = useState(color.name);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = COLOR_PALETTE.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  const select = (c) => {
    setQuery(c.name);
    setOpen(false);
    onColorChange(idx, 'name', c.name);
    onColorChange(idx, 'hexCode', c.hexCode);
  };

  const handleType = (val) => {
    setQuery(val);
    onColorChange(idx, 'name', val);
    setOpen(true);
  };

  return (
    <div className="color-row" ref={ref}>
      <div
        className="color-swatch-preview"
        style={{ background: color.hexCode, border: color.hexCode === '#FFFFFF' ? '1px solid #e2e8f0' : 'none' }}
        title={color.name}
      />
      <div className="color-typeahead" style={{ position: 'relative', flex: 1 }}>
        <input
          value={query}
          onChange={(e) => handleType(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Type a color name..."
          autoComplete="off"
        />
        {open && filtered.length > 0 && (
          <div className="color-dropdown">
            {filtered.map((c) => (
              <div key={c.name} className="color-option" onClick={() => select(c)}>
                <span className="color-option-swatch" style={{ background: c.hexCode, border: c.hexCode === '#FFFFFF' ? '1px solid #cbd5e1' : 'none' }} />
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {showRemove && (
        <button type="button" className="btn-icon" onClick={() => onRemove(idx)}><FiX /></button>
      )}
    </div>
  );
};

const AdminAddProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', price: '', originalPrice: '',
    category: '', gender: 'Men', brand: '', material: '',
    season: 'All Season',
    isPinnedTopDeals: false,
    images: [], sizes: [{ size: 'S', stock: 0 }],
    colors: [{ name: '', hexCode: '#000000' }], tags: '',
  });

  useEffect(() => {
    API.get('/categories').then((res) => setCategories(res.data.categories));
    if (isEdit) {
      API.get(`/products/${id}`).then((res) => {
        const p = res.data.product;
        setForm({
          name: p.name, description: p.description, price: p.price,
          originalPrice: p.originalPrice || '', category: p.category?._id || p.category,
          gender: p.gender, brand: p.brand, material: p.material || '',
          season: p.season || 'All Season',
          isPinnedTopDeals: p.isPinnedTopDeals || false,
          images: p.images || [],
          sizes: p.sizes?.length ? p.sizes : [{ size: 'S', stock: 0 }],
          colors: p.colors?.length ? p.colors : [{ name: '', hexCode: '#000000' }],
          tags: p.tags?.join(', ') || '',
        });
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSizeChange = (idx, field, val) => {
    const sizes = [...form.sizes];
    sizes[idx] = { ...sizes[idx], [field]: field === 'stock' ? Number(val) : val };
    setForm({ ...form, sizes });
  };

  const handleColorChange = (idx, field, val) => {
    const colors = [...form.colors];
    colors[idx] = { ...colors[idx], [field]: val };
    setForm({ ...form, colors });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      setUploading(true);
      const res = await API.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm((prev) => ({ ...prev, images: [...prev.images, res.data.url] }));
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (idx) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category || !form.brand) {
      return toast.error('Please fill all required fields');
    }
    try {
      setLoading(true);
      const data = {
        ...form,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice) || Number(form.price),
        images: form.images.filter(Boolean),
        colors: form.colors.filter((c) => c.name),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      if (isEdit) {
        await API.put(`/products/${id}`, data);
        toast.success('Product updated!');
      } else {
        await API.post('/products', data);
        toast.success('Product created!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

  return (
    <AdminLayout title={isEdit ? 'Edit Product' : 'Add New Product'}>
      <form onSubmit={handleSubmit} className="admin-section animate-fadeIn">
        {/* ── Pinning Banner ── */}
        <div className="pin-banner">
          <label className={`pin-toggle ${form.isPinnedTopDeals ? 'active' : ''}`}>
            <input
              type="checkbox"
              name="isPinnedTopDeals"
              checked={form.isPinnedTopDeals}
              onChange={handleChange}
            />
            <FiTag />
            <span>Pin to Top Deals</span>
            {form.isPinnedTopDeals && <span className="pin-badge">Pinned</span>}
          </label>
        </div>

        <div className="product-form-grid">
          <div className="form-col">
            <div className="input-group">
              <label>Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Classic Cotton T-Shirt" required />
            </div>
            <div className="input-group">
              <label>Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Product description..." required />
            </div>
            <div className="form-row">
              <div className="input-group"><label>Price (₹) *</label><input type="number" name="price" value={form.price} onChange={handleChange} required /></div>
              <div className="input-group"><label>Original Price (₹)</label><input type="number" name="originalPrice" value={form.originalPrice} onChange={handleChange} /></div>
            </div>
            <div className="form-row">
              <div className="input-group"><label>Category *</label>
                <select name="category" value={form.category} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  {categories.map((c) => {
                    const displayName = c.parent
                      ? `${typeof c.parent === 'object' ? c.parent.name : 'Parent'} > ${c.name}`
                      : c.name;
                    return <option key={c._id} value={c._id}>{displayName}</option>;
                  })}
                </select>
              </div>
              <div className="input-group"><label>Gender *</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option>Men</option><option>Women</option><option>Kids</option><option>Unisex</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="input-group"><label>Brand *</label><input name="brand" value={form.brand} onChange={handleChange} required /></div>
              <div className="input-group"><label>Material</label><input name="material" value={form.material} onChange={handleChange} /></div>
            </div>
            {/* ── Season Selector ── */}
            <div className="input-group">
              <label>Season</label>
              <div className="season-options">
                {['Summer', 'Winter', 'Monsoon', 'Spring', 'All Season'].map((s) => (
                  <label key={s} className={`season-chip ${form.season === s ? 'active' : ''}`}>
                    <input type="radio" name="season" value={s} checked={form.season === s} onChange={handleChange} hidden />
                    {s === 'Summer' && '☀️'}
                    {s === 'Winter' && '❄️'}
                    {s === 'Monsoon' && '🌧️'}
                    {s === 'Spring' && '🌸'}
                    {s === 'All Season' && '🌍'}
                    {' '}{s}
                  </label>
                ))}
              </div>
            </div>
            <div className="input-group"><label>Tags (comma separated)</label><input name="tags" value={form.tags} onChange={handleChange} placeholder="cotton, casual, summer" /></div>
          </div>

          <div className="form-col">
            <div className="admin-section-header">
              <h3>Product Images</h3>
              <p>Upload professional product photos (direct file upload)</p>
            </div>
            <div className="image-upload-grid">
              {form.images.map((img, idx) => (
                <div key={idx} className="image-preview-card">
                  <img src={getProductImage(img)} alt="" />
                  <button type="button" className="remove-img" onClick={() => handleRemoveImage(idx)}><FiX /></button>
                </div>
              ))}
              <label className={`upload-zone ${uploading ? 'uploading' : ''}`}>
                {uploading ? <div className="spinner-sm"></div> : <><FiPlus /><span>Upload</span><input type="file" onChange={handleFileUpload} hidden accept="image/*" /></>}
              </label>
            </div>

            <div className="admin-section-header" style={{ marginTop: 24 }}>
              <h3>Sizes & Stock</h3>
            </div>
            {form.sizes.map((s, idx) => (
              <div key={idx} className="size-row">
                <select value={s.size} onChange={(e) => handleSizeChange(idx, 'size', e.target.value)}>
                  {sizeOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
                <input type="number" value={s.stock} onChange={(e) => handleSizeChange(idx, 'stock', e.target.value)} placeholder="Stock" />
                {form.sizes.length > 1 && <button type="button" className="btn-icon" onClick={() => setForm({ ...form, sizes: form.sizes.filter((_, i) => i !== idx) })}><FiX /></button>}
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, sizes: [...form.sizes, { size: 'M', stock: 0 }] })}><FiPlus /> Add Size</button>

            <div className="admin-section-header" style={{ marginTop: 24 }}>
              <h3>Colors</h3>
              <p>Type a color name to get suggestions</p>
            </div>
            {form.colors.map((c, idx) => (
              <ColorInput
                key={idx}
                color={c}
                idx={idx}
                onColorChange={handleColorChange}
                onRemove={(i) => setForm({ ...form, colors: form.colors.filter((_, ci) => ci !== i) })}
                showRemove={form.colors.length > 1}
              />
            ))}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, colors: [...form.colors, { name: '', hexCode: '#000000' }] })}><FiPlus /> Add Color</button>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
          </button>
          <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate('/admin/products')}>Cancel</button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminAddProduct;
