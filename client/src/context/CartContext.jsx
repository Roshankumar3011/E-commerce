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
      syncAndFetchCart();
    } else {
      const localCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [], totalAmount: 0 };
      setCart(localCart);
    }
  }, [user]);

  const syncAndFetchCart = async () => {
    try {
      setCartLoading(true);
      const localCart = JSON.parse(localStorage.getItem('guestCart'));
      if (localCart && localCart.items && localCart.items.length > 0) {
        for (const item of localCart.items) {
          try {
            await API.post('/cart/add', { 
              productId: item.product._id, 
              size: item.size, 
              color: item.color, 
              quantity: item.quantity 
            });
          } catch (err) {
            console.error('Failed to sync item:', err);
          }
        }
        localStorage.removeItem('guestCart');
      }
      const res = await API.get('/cart');
      setCart(res.data.cart);
    } catch (error) {
      console.error('Fetch cart error:', error);
    } finally {
      setCartLoading(false);
    }
  };

  const fetchCart = async () => {
    if (!user) return;
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

  const calculateTotalAmount = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const addToCart = async (productOrId, size, color, quantity = 1) => {
    try {
      if (user) {
        const productId = typeof productOrId === 'object' ? productOrId._id : productOrId;
        const res = await API.post('/cart/add', { productId, size, color, quantity });
        setCart(res.data.cart);
        toast.success('Added to cart!');
      } else {
        if (typeof productOrId !== 'object') {
           console.error('Guest cart requires full product object');
           return toast.error('Failed to add to cart (missing product details)');
        }
        
        let localCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [], totalAmount: 0 };
        const existingItemIndex = localCart.items.findIndex(
          (item) => item.product._id === productOrId._id && item.size === size && (item.color?.name === color?.name || !item.color)
        );
        
        if (existingItemIndex > -1) {
          localCart.items[existingItemIndex].quantity += quantity;
        } else {
          localCart.items.push({
            _id: Math.random().toString(36).substring(7),
            product: productOrId,
            size,
            color,
            quantity,
            price: productOrId.price
          });
        }
        localCart.totalAmount = calculateTotalAmount(localCart.items);
        localStorage.setItem('guestCart', JSON.stringify(localCart));
        setCart(localCart);
        toast.success('Added to cart!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      if (user) {
        const res = await API.put(`/cart/update/${itemId}`, { quantity });
        setCart(res.data.cart);
      } else {
        let localCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [], totalAmount: 0 };
        const itemIndex = localCart.items.findIndex((i) => i._id === itemId || i.product._id === itemId);
        if (itemIndex > -1) {
          if (quantity <= 0) {
             localCart.items.splice(itemIndex, 1);
          } else {
             localCart.items[itemIndex].quantity = quantity;
          }
          localCart.totalAmount = calculateTotalAmount(localCart.items);
          localStorage.setItem('guestCart', JSON.stringify(localCart));
          setCart(localCart);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      if (user) {
        const res = await API.delete(`/cart/remove/${itemId}`);
        setCart(res.data.cart);
        toast.success('Removed from cart');
      } else {
        let localCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [], totalAmount: 0 };
        localCart.items = localCart.items.filter((i) => i._id !== itemId && i.product._id !== itemId);
        localCart.totalAmount = calculateTotalAmount(localCart.items);
        localStorage.setItem('guestCart', JSON.stringify(localCart));
        setCart(localCart);
        toast.success('Removed from cart');
      }
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      if (user) {
        await API.delete('/cart/clear');
      } else {
        localStorage.removeItem('guestCart');
      }
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
