import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist({ products: [] });
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const res = await API.get('/wishlist');
      setWishlist(res.data.wishlist);
    } catch (error) {
      console.error('Fetch wishlist error:', error);
    }
  };

  const toggleWishlist = async (productId) => {
    try {
      const res = await API.post('/wishlist/toggle', { productId });
      setWishlist(res.data.wishlist);
      toast.success(res.data.added ? 'Added to wishlist ❤️' : 'Removed from wishlist');
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.products?.some((p) => (p._id || p) === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
