import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart({ items: [], totalAmount: 0 });
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const res = await API.get('/cart');
      setCart(res.data.cart);
    } catch (error) {
      console.error('Fetch cart error:', error);
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (productId, size, color, quantity = 1) => {
    try {
      const res = await API.post('/cart/add', { productId, size, color, quantity });
      setCart(res.data.cart);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await API.put(`/cart/update/${itemId}`, { quantity });
      setCart(res.data.cart);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await API.delete(`/cart/remove/${itemId}`);
      setCart(res.data.cart);
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await API.delete('/cart/clear');
      setCart({ items: [], totalAmount: 0 });
    } catch (error) {
      console.error('Clear cart error:', error);
    }
  };

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, cartLoading, cartCount, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
