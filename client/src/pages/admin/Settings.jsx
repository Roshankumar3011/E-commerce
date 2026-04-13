import React, { useState, useEffect } from 'react';
import { FiSave, FiImage, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { AdminLayout } from './Dashboard';
import API from '../../utils/api';
import './Admin.css';
import { useSettings } from '../../context/SettingsContext';

const AdminSettings = () => {
  const { settings: globalSettings, refetchSettings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const DEFAULT_SETTINGS = {
    logoUrl: '',
    contact: { email: 'support@balajee.com', phone: '+91 1800-123-4567', address: 'Mumbai, India' },
    socialLinks: { facebook: '#', twitter: '#', linkedin: '#', instagram: '#' },
    banners: [
      { image: '', text: "BUY 1 GET 1 FREE", subtext: "On Bestsellers", color: "linear-gradient(135deg, #6366f1, #a855f7)" },
      { image: '', text: "FLAT ₹500 OFF", subtext: "On orders above ₹1499", color: "linear-gradient(135deg, #f43f5e, #fb923c)" },
      { image: '', text: "EXTRA 10% OFF", subtext: "For VIP Members", color: "linear-gradient(135deg, #06b6d4, #0ea5e9)" }
    ]
  };

  const [form, setForm] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    if (globalSettings) {
      setForm({
        logoUrl: globalSettings.logoUrl || '',
        contact: {
          email: globalSettings.contact?.email || '',
          phone: globalSettings.contact?.phone || '',
          address: globalSettings.contact?.address || ''
        },
        socialLinks: {
          facebook: globalSettings.socialLinks?.facebook || '',
          twitter: globalSettings.socialLinks?.twitter || '',
          linkedin: globalSettings.socialLinks?.linkedin || '',
          instagram: globalSettings.socialLinks?.instagram || ''
        },
        banners: globalSettings.banners || []
      });
    }
  }, [globalSettings]);

  const handleContactChange = (field, val) => {
    setForm(prev => ({ ...prev, contact: { ...prev.contact, [field]: val } }));
  };

  const handleSocialChange = (field, val) => {
    setForm(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [field]: val } }));
  };

  const handleBannerChange = (idx, field, val) => {
    const newBanners = [...form.banners];
    newBanners[idx] = { ...newBanners[idx], [field]: val };
    setForm(prev => ({ ...prev, banners: newBanners }));
  };

  const addBanner = () => {
    setForm(prev => ({ ...prev, banners: [...prev.banners, { image: '', text: '', subtext: '', ctaLink: '/products' }] }));
  };

  const removeBanner = (idx) => {
    setForm(prev => ({ ...prev, banners: prev.banners.filter((_, i) => i !== idx) }));
  };

  const removeBannerImage = (idx) => {
    handleBannerChange(idx, 'image', '');
  };

  const validateImageDimensions = (file, type) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const { width, height } = img;
        URL.revokeObjectURL(img.src);
        
        if (type === 'logo') {
          // Logo constraint: Max 200x80
          if (width > 250 || height > 100) {
            reject('Logo too large. Max size: 250x100px');
          } else {
            resolve();
          }
        } else if (type === 'banner') {
          // Banner constraint: ~1200x400 (3:1 ratio recommended)
          // For simplicity, let's require minimum 800x200 or exact 3:1 ratio? 
          // User said "same size of banner". Let's assume 1200x400.
          if (width < 800 || height < 200) {
            reject('Banner too small. Minimum: 800x200px');
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      };
      img.onerror = () => reject('Invalid image file');
    });
  };

  const handleImageUpload = async (e, type, bannerIdx = null) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await validateImageDimensions(file, type);
    } catch (err) {
      toast.error(err);
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    try {
      setUploading(true);
      const res = await API.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (type === 'logo') {
        setForm(prev => ({ ...prev, logoUrl: res.data.url }));
      } else if (type === 'banner') {
        handleBannerChange(bannerIdx, 'image', res.data.url);
      }
      toast.success('Image uploaded successfully!');
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Handle empty states - if user wiped everything, it sets defaults on save
      const finalData = {
        ...form,
        contact: {
          email: form.contact.email || DEFAULT_SETTINGS.contact.email,
          phone: form.contact.phone || DEFAULT_SETTINGS.contact.phone,
          address: form.contact.address || DEFAULT_SETTINGS.contact.address,
        },
        socialLinks: {
          facebook: form.socialLinks.facebook || DEFAULT_SETTINGS.socialLinks.facebook,
          twitter: form.socialLinks.twitter || DEFAULT_SETTINGS.socialLinks.twitter,
          linkedin: form.socialLinks.linkedin || DEFAULT_SETTINGS.socialLinks.linkedin,
          instagram: form.socialLinks.instagram || DEFAULT_SETTINGS.socialLinks.instagram,
        },
        banners: form.banners.length > 0 ? form.banners : DEFAULT_SETTINGS.banners
      };

      await API.put('/settings', finalData);
      toast.success('Store settings updated!');
      refetchSettings();
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Edit Store Settings">
      <form onSubmit={handleSubmit} className="admin-section animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Logo Section */}
        <div className="admin-card">
          <h3>Store Logo</h3>
          <div className="logo-upload-wrap" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '12px' }}>
            {form.logoUrl ? (
              <img src={form.logoUrl} alt="Store Logo" style={{ height: '60px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            ) : (
              <div style={{ height: '60px', width: '120px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#94a3b8' }}>No Logo</div>
            )}
            <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
              <FiImage /> {uploading ? 'Uploading...' : 'Upload Logo'}
              <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} disabled={uploading} />
            </label>
            {form.logoUrl && (
              <button type="button" className="btn btn-ghost" onClick={() => setForm(prev => ({ ...prev, logoUrl: '' }))}>Remove</button>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="admin-card">
          <h3>Contact Details</h3>
          <div className="form-row" style={{ marginTop: '12px' }}>
            <div className="input-group">
              <label>Support Email</label>
              <input value={form.contact.email} onChange={(e) => handleContactChange('email', e.target.value)} placeholder="support@balajee.com" />
            </div>
            <div className="input-group">
              <label>Support Phone</label>
              <input value={form.contact.phone} onChange={(e) => handleContactChange('phone', e.target.value)} placeholder="+91 1800-123-4567" />
            </div>
            <div className="input-group">
              <label>Business Address</label>
              <input value={form.contact.address} onChange={(e) => handleContactChange('address', e.target.value)} placeholder="Mumbai, India" />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="admin-card">
          <h3>Social Links</h3>
          <div className="form-row" style={{ marginTop: '12px' }}>
            <div className="input-group">
              <label>Facebook URL (f)</label>
              <input value={form.socialLinks.facebook} onChange={(e) => handleSocialChange('facebook', e.target.value)} placeholder="https://facebook.com/..." />
            </div>
            <div className="input-group">
              <label>Twitter/X URL (𝕏)</label>
              <input value={form.socialLinks.twitter} onChange={(e) => handleSocialChange('twitter', e.target.value)} placeholder="https://x.com/..." />
            </div>
          </div>
          <div className="form-row">
             <div className="input-group">
              <label>LinkedIn URL (in)</label>
              <input value={form.socialLinks.linkedin} onChange={(e) => handleSocialChange('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="input-group">
              <label>Instagram URL (ig)</label>
              <input value={form.socialLinks.instagram} onChange={(e) => handleSocialChange('instagram', e.target.value)} placeholder="https://instagram.com/..." />
            </div>
          </div>
        </div>

        {/* Promotional Banners */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Homepage Promotional Banners</h3>
            <button type="button" className="btn btn-outline btn-sm" onClick={addBanner}><FiPlus /> Add Banner</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {form.banners.map((banner, idx) => (
              <div key={idx} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', gap: '16px' }}>
                <div style={{ width: '150px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {banner.image ? (
                    <div style={{ position: 'relative' }}>
                      <img src={banner.image} alt="Banner" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                      <button 
                        type="button" 
                        className="btn-icon" 
                        style={{ position: 'absolute', top: '4px', right: '4px', padding: '4px', background: 'rgba(255,255,255,0.9)', color: '#ef4444' }} 
                        onClick={() => removeBannerImage(idx)}
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '80px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>No Image</div>
                  )}
                  <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', textAlign: 'center' }}>
                    {banner.image ? 'Change Image' : 'Upload Image'}
                    <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'banner', idx)} disabled={uploading} />
                  </label>
                  <p style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center' }}>Min 1200x400 recommended</p>
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-row">
                    <div className="input-group">
                       <label>Primary Text</label>
                       <input value={banner.text} onChange={(e) => handleBannerChange(idx, 'text', e.target.value)} placeholder="e.g. BUY 1 GET 1 FREE" required />
                    </div>
                    <div className="input-group">
                       <label>Subtext</label>
                       <input value={banner.subtext} onChange={(e) => handleBannerChange(idx, 'subtext', e.target.value)} placeholder="e.g. On Bestsellers" />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <button type="button" className="btn-icon" style={{ background: '#fee2e2', color: '#ef4444' }} onClick={() => removeBanner(idx)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
            {form.banners.length === 0 && <p style={{ color: '#94a3b8' }}>No banners added. Click 'Add Banner' to create one for the homepage.</p>}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading || uploading}>
            {loading ? 'Saving...' : <><FiSave /> Save Store Settings</>}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminSettings;
