import { useState, useEffect } from 'react';
import { FiX, FiCheckCircle } from 'react-icons/fi';
import { getProductImage } from '../utils/assets';
import './VariantDrawer.css';

const VariantDrawer = ({ isOpen, onClose, product, onConfirm }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Default selections
      if (product?.colors?.length > 0 && !selectedColor) setSelectedColor(product.colors[0]);
      if (product?.sizes?.length === 1) setSelectedSize(product.sizes[0].size);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, product, selectedColor]);

  const handleConfirm = () => {
    if (product.colors?.length > 0 && !selectedColor) {
      return alert('Please select a color');
    }
    if (product.sizes?.length > 0 && !selectedSize) {
      return alert('Please select a size');
    }
    onConfirm(selectedSize, selectedColor);
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className={`drawer-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="variant-drawer animate-slideLeft" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-handle"></div>
        <div className="drawer-header">
          <h3>Select variant</h3>
          <button className="drawer-close" onClick={onClose}><FiX /></button>
        </div>

        <div className="drawer-product-summary">
          <div className="mini-product-img">
            <img src={getProductImage(product.images?.[0])} alt={product.name} />
          </div>
          <div className="mini-product-info">
            <p className="mini-brand">{product.brand}</p>
            <h4 className="mini-name">{product.name}</h4>
            <div className="mini-pricing">
              <span className="mini-price">₹{product.price?.toLocaleString()}</span>
              {product.originalPrice > product.price && (
                <span className="mini-original">₹{product.originalPrice?.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>

        <div className="drawer-body">
          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="drawer-section">
              <p className="section-title">Selected Color: <span>{selectedColor?.name || 'None'}</span></p>
              <div className="color-grid">
                {product.colors.map((color, idx) => (
                  <button
                    key={idx}
                    className={`color-bubble ${selectedColor?.name === color.name ? 'active' : ''}`}
                    onClick={() => setSelectedColor(color)}
                    style={{ background: color.hexCode }}
                    title={color.name}
                  >
                    {selectedColor?.name === color.name && <FiCheckCircle />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="drawer-section">
              <p className="section-title">Select Size</p>
              <div className="size-grid">
                {product.sizes.map((s) => (
                  <button
                    key={s.size}
                    className={`size-tile ${selectedSize === s.size ? 'active' : ''} ${s.stock === 0 ? 'disabled' : ''}`}
                    onClick={() => s.stock > 0 && setSelectedSize(s.size)}
                    disabled={s.stock === 0}
                  >
                    {s.size}
                    {s.stock > 0 && s.stock <= 5 && <span className="low-stock-dot" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <button className="btn btn-secondary btn-lg btn-block" onClick={handleConfirm}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariantDrawer;
