const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Resolves the full URL for a product image.
 * Works for both absolute URLs (e.g. Unsplash) and local paths (e.g. /uploads/...).
 * 
 * @param {string} imagePath - The path or URL of the image.
 * @param {string} placeholder - Optional placeholder URL if no path is provided.
 * @returns {string} The resolved image URL.
 */
export const getProductImage = (imagePath, placeholder = 'https://via.placeholder.com/400x500?text=No+Image') => {
  if (!imagePath) return placeholder;

  // If it's an external URL (starts with http), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // If it starts with /uploads, return the path. 
  // Since we've added a Vite proxy, we can use the relative path directly.
  // However, for safety/production readiness, we can also ensure it starts with /
  if (imagePath.startsWith('/uploads') || imagePath.startsWith('uploads')) {
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return cleanPath;
  }

  return imagePath;
};
