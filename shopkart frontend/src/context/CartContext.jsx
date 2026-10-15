import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await axios.get("http://localhost:3000/cart", { withCredentials: true });
      setCart(res.data.cart || []);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId) => {
    try {
      await axios.post(`http://localhost:3000/cart/${productId}`, {}, { withCredentials: true });
      // FIX: Adha data set karne ki jagah backend se poora data fresh mangwao
      await fetchCart(); 
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Error adding to cart" };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await axios.patch(`http://localhost:3000/cart/${productId}`, { quantity }, { withCredentials: true });
  
      await fetchCart();
    } catch (error) {
      alert(error.response?.data?.message || "Error updating quantity");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`http://localhost:3000/cart/${productId}`, { withCredentials: true });
   
      await fetchCart();
    } catch (error) {
      alert("Error removing item");
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => {
    if (item.product && item.product.price) {
      return total + (item.product.price * item.quantity);
    }
    return total;
  }, 0);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, cartCount, cartSubtotal, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};