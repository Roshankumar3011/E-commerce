import { useState, useEffect, useMemo } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiTag, FiUsers } from 'react-icons/fi';
import { AdminLayout } from './Dashboard';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './Admin.css';

const GENDER_OPTIONS = ['Men', 'Women', 'Kids'];

const GENDER_COLORS = {
  Men:   { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  Women: { bg: '#FDF2F8', text: '#9D174D', border: '#FBCFE8' },
  Kids:  { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
};

/** Badge component for gender & parent labels */
const Badge = ({ label, gender }) => {
  const style = gender && GENDER_COLORS[gender]
    ? { background: GENDER_COLORS[gender].bg, color: GENDER_COLORS[gender].text, border: `1px solid ${GENDER_COLORS[gender].border}` }
    : { background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' };
  return (
    <span style={{ ...style, borderRadius: 6, padding: '2px 9px', fontSize: 12, fontWeight: 600, display: 'inline-block' }}>
      {label}
    </span>
  );
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { name: '', description: '', gender: '', parentId: '' };
  const [formData, setFormData] = useState(emptyForm);

  // ── Fetch all categories ────────────────────────────────────
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get('/categories');
      setCategories(res.data.categories || []);
    } catch {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // ── Derived helpers ─────────────────────────────────────────

  /** Root category object for a given gender label */
  const genderRoot = useMemo(() => {
    const map = {};
    GENDER_OPTIONS.forEach(g => {
      const root = categories.find(c => c.name === g && !c.parent);
      if (root) map[g] = root;
    });
    return map;
  }, [categories]);

  /**
   * Children of the selected gender root — shown as optional
   * "sub-parent" choices so admins can create deeply nested categories.
   */
  const genderChildren = useMemo(() => {
    if (!formData.gender) return [];
    const root = genderRoot[formData.gender];
    if (!root) return [];
    return categories.filter(c => {
      const pid = c.parent?._id?.toString() || c.parent?.toString();
      return pid === root._id.toString();
    });
  }, [formData.gender, genderRoot, categories]);

  /**
   * Determines what gender a category belongs to by walking its
   * parent chain up to the root.
   */
  const getCategoryGender = (cat) => {
    if (!cat.parent) {
      // It IS a root — check if its name is a gender
      return GENDER_OPTIONS.includes(cat.name) ? cat.name : null;
    }
    const parentId = cat.parent?._id?.toString() || cat.parent?.toString();
    for (const g of GENDER_OPTIONS) {
      const root = genderRoot[g];
      if (root && root._id.toString() === parentId) return g;
      // grandchild: parent's parent is root
      const parent = categories.find(c => c._id.toString() === parentId);
      if (parent) {
        const grandParentId = parent.parent?._id?.toString() || parent.parent?.toString();
        if (root && grandParentId === root._id.toString()) return g;
      }
    }
    return null;
  };

  // ── Modal helpers ───────────────────────────────────────────
  const openAdd = () => {
    setEditingCategory(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditingCategory(cat);
    // Infer gender from parent chain
    const g = getCategoryGender(cat);
    // If cat.parent is a gender root, parentId stays the root; if it's a child, pick that child
    const root = g ? genderRoot[g] : null;
    const parentId = cat.parent
      ? (cat.parent?._id?.toString() || cat.parent?.toString())
      : '';
    const isDirectGenderChild = root && parentId === root._id.toString();
    setFormData({
      name: cat.name,
      description: cat.description || '',
      gender: g || '',
      // If parent IS the gender root → no sub-parent selected; if deeper → select it
      parentId: isDirectGenderChild ? '' : parentId,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData(emptyForm);
  };

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Category name is required');

    setSaving(true);
    try {
      // Resolve the actual parent ID to send
      let resolvedParentId = null;
      if (formData.gender) {
        const root = genderRoot[formData.gender];
        if (formData.parentId) {
          // sub-parent selected → use it
          resolvedParentId = formData.parentId;
        } else if (root) {
          // no sub-parent → parent is the gender root itself
          resolvedParentId = root._id;
        }
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        ...(resolvedParentId ? { parent: resolvedParentId } : {}),
        isActive: true,
      };

      if (editingCategory) {
        await API.put(`/categories/${editingCategory._id}`, payload);
        toast.success('Category updated ✓');
      } else {
        await API.post('/categories', payload);
        toast.success('Category created ✓');
      }
      closeModal();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? This cannot be undone.')) return;
    try {
      await API.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  // ── Sorted table data: roots first, then children grouped ──
  const sortedCategories = useMemo(() => {
    const roots = categories.filter(c => !c.parent);
    const children = categories.filter(c => c.parent);
    const result = [];
    roots.forEach(r => {
      result.push(r);
      children.forEach(c => {
        const pid = c.parent?._id?.toString() || c.parent?.toString();
        if (pid === r._id.toString()) result.push(c);
      });
    });
    // Add any remaining orphans
    children.forEach(c => {
      if (!result.find(r => r._id === c._id)) result.push(c);
    });
    return result;
  }, [categories]);

  // ── Render ──────────────────────────────────────────────────
  return (
    <AdminLayout title="Manage Categories">

      {/* Top action bar */}
      <div className="admin-actions animate-fadeIn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {categories.length} categories total
        </p>
        <button className="btn btn-primary" onClick={openAdd}>
          <FiPlus /> Add Category
        </button>
      </div>

      {/* Quick gender groups summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {GENDER_OPTIONS.map(g => {
          const root = genderRoot[g];
          const count = root
            ? categories.filter(c => getCategoryGender(c) === g && c.name !== g).length
            : 0;
          return (
            <div key={g} style={{
              flex: 1, padding: '14px 18px', borderRadius: 12,
              background: GENDER_COLORS[g].bg, border: `1px solid ${GENDER_COLORS[g].border}`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <FiUsers style={{ color: GENDER_COLORS[g].text, fontSize: 20 }} />
              <div>
                <div style={{ fontWeight: 700, color: GENDER_COLORS[g].text }}>{g}</div>
                <div style={{ fontSize: 12, color: GENDER_COLORS[g].text, opacity: 0.8 }}>
                  {count} sub-categories
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="admin-section animate-slideUp">
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Gender</th>
                  <th>Parent</th>
                  <th>Description</th>
                  <th>Slug</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedCategories.map(cat => {
                  const g = getCategoryGender(cat);
                  const isRoot = GENDER_OPTIONS.includes(cat.name) && !cat.parent;
                  return (
                    <tr key={cat._id} style={isRoot ? { background: 'var(--bg-secondary)' } : {}}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {isRoot && <FiTag style={{ color: 'var(--primary)', fontSize: 14 }} />}
                          <strong style={{ paddingLeft: isRoot ? 0 : 20, color: isRoot ? 'var(--primary)' : 'inherit' }}>
                            {cat.name}
                          </strong>
                        </div>
                      </td>
                      <td>
                        {g ? <Badge label={g} gender={g} /> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td>
                        {cat.parent
                          ? <Badge label={cat.parent.name || 'Parent'} />
                          : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Root</span>}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 200 }}>
                        {cat.description || '—'}
                      </td>
                      <td><code style={{ fontSize: 12 }}>{cat.slug}</code></td>
                      <td>
                        <div className="admin-row-actions">
                          <button className="btn-icon" onClick={() => openEdit(cat)} title="Edit"><FiEdit2 /></button>
                          <button className="btn-icon delete" onClick={() => handleDelete(cat._id)} title="Delete"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL ────────────────────────────────────────────── */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal animate-zoomIn" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>

            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'New Category'}</h2>
              <button className="btn-close" onClick={closeModal}><FiX /></button>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Category Name */}
              <div className="input-group">
                <label>Category Name <span style={{ color: 'var(--primary)' }}>*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. T-Shirts, Kurti, Jackets"
                  required
                />
              </div>

              {/* Gender selector */}
              <div className="input-group">
                <label>Gender</label>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  {/* "No gender" option */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: '', parentId: '' })}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer',
                      border: `2px solid ${!formData.gender ? 'var(--primary)' : '#E5E7EB'}`,
                      background: !formData.gender ? 'var(--primary-light)' : '#fff',
                      color: !formData.gender ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
                    }}
                  >
                    None
                  </button>
                  {GENDER_OPTIONS.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: g, parentId: '' })}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer',
                        border: `2px solid ${formData.gender === g ? GENDER_COLORS[g].border : '#E5E7EB'}`,
                        background: formData.gender === g ? GENDER_COLORS[g].bg : '#fff',
                        color: formData.gender === g ? GENDER_COLORS[g].text : 'var(--text-secondary)',
                        fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {formData.gender && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    This category will appear under <strong>{formData.gender}</strong> in the store.
                  </p>
                )}
              </div>

              {/* Sub-parent (only shown if gender children exist) */}
              {formData.gender && genderChildren.length > 0 && (
                <div className="input-group">
                  <label>Sub-parent <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></label>
                  <select
                    value={formData.parentId}
                    onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="">— Direct child of {formData.gender} —</option>
                    {genderChildren.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    Leave empty to place directly under <strong>{formData.gender}</strong>.
                  </p>
                </div>
              )}

              {/* Description */}
              <div className="input-group">
                <label>Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category..."
                  rows={3}
                />
              </div>

              {/* Preview */}
              {formData.name && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                  background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)',
                  fontSize: 13, color: 'var(--text-secondary)',
                }}>
                  📂 <strong>{formData.gender || 'Root'}</strong>
                  {formData.gender && <> → {
                    formData.parentId
                      ? <><strong>{genderChildren.find(c => c._id === formData.parentId)?.name}</strong> → </>
                      : null
                  }<strong style={{ color: 'var(--primary)' }}>{formData.name}</strong></>}
                  {!formData.gender && <> <strong style={{ color: 'var(--primary)' }}>{formData.name}</strong></>}
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;
