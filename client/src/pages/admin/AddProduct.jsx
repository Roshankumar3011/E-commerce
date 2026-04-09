import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiX } from 'react-icons/fi';
import { AdminLayout } from './Dashboard';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminAddProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: '', description: '', price: '', originalPrice: '',
    category: '', gender: 'Men', brand: '', material: '',
    images: [''], sizes: [{ size: 'S', stock: 0 }],
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
          images: p.images?.length ? p.images : [''],
          sizes: p.sizes?.length ? p.sizes : [{ size: 'S', stock: 0 }],
          colors: p.colors?.length ? p.colors : [{ name: '', hexCode: '#000000' }],
          tags: p.tags?.join(', ') || '',
        });
      });
    }
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (idx, val) => {
    const imgs = [...form.images];
    imgs[idx] = val;
    setForm({ ...form, images: imgs });
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
        images: form.images.filter((i) => i),
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="input-group" style={{ gridColumn: '1/-1' }}>
            <label>Product Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Classic Cotton T-Shirt" required />
          </div>
          <div className="input-group" style={{ gridColumn: '1/-1' }}>
            <label>Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Product description..." required />
          </div>
          <div className="input-group"><label>Selling Price (₹) *</label><input type="number" name="price" value={form.price} onChange={handleChange} required /></div>
          <div className="input-group"><label>Original Price (₹)</label><input type="number" name="originalPrice" value={form.originalPrice} onChange={handleChange} /></div>
          <div className="input-group"><label>Category *</label>
            <select name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="input-group"><label>Gender *</label>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option>Men</option><option>Women</option><option>Kids</option><option>Unisex</option>
            </select>
          </div>
          <div className="input-group"><label>Brand *</label><input name="brand" value={form.brand} onChange={handleChange} required /></div>
          <div className="input-group"><label>Material</label><input name="material" value={form.material} onChange={handleChange} /></div>
          <div className="input-group" style={{ gridColumn: '1/-1' }}><label>Tags (comma separated)</label><input name="tags" value={form.tags} onChange={handleChange} placeholder="cotton, casual, summer" /></div>
        </div>

        {/* Images */}
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Product Images (URLs)</h3>
          {form.images.map((img, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input value={img} onChange={(e) => handleImageChange(idx, e.target.value)} placeholder="Image URL" style={{ flex: 1, padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
              {form.images.length > 1 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })}><FiX /></button>}
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }} onClick={() => setForm({ ...form, images: [...form.images, ''] })}><FiPlus /> Add Image</button>
        </div>

        {/* Sizes */}
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Sizes & Stock</h3>
          {form.sizes.map((s, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <select value={s.size} onChange={(e) => handleSizeChange(idx, 'size', e.target.value)} style={{ padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13 }}>
                {sizeOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
              <input type="number" value={s.stock} onChange={(e) => handleSizeChange(idx, 'stock', e.target.value)} placeholder="Stock" style={{ width: 100, padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
              {form.sizes.length > 1 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, sizes: form.sizes.filter((_, i) => i !== idx) })}><FiX /></button>}
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }} onClick={() => setForm({ ...form, sizes: [...form.sizes, { size: 'M', stock: 0 }] })}><FiPlus /> Add Size</button>
        </div>

        {/* Colors */}
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Colors</h3>
          {form.colors.map((c, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input value={c.name} onChange={(e) => handleColorChange(idx, 'name', e.target.value)} placeholder="Color name" style={{ flex: 1, padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
              <input type="color" value={c.hexCode} onChange={(e) => handleColorChange(idx, 'hexCode', e.target.value)} style={{ width: 44, height: 44, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
              {form.colors.length > 1 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, colors: form.colors.filter((_, i) => i !== idx) })}><FiX /></button>}
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }} onClick={() => setForm({ ...form, colors: [...form.colors, { name: '', hexCode: '#000000' }] })}><FiPlus /> Add Color</button>
        </div>

        <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
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
