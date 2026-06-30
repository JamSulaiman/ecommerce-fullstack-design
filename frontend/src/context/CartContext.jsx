import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCart(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const exist = prev.find(i => i._id === product._id);
      if (exist) return prev.map(i => i._id === product._id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { ...product, quantity: qty }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i._id !== id));

  const clearCart = () => setCart([]);

  const incrementItem = (id) => {
    setCart(prev => prev.map(i => i._id === id ? { ...i, quantity: i.quantity + 1 } : i));
  };

  const decrementItem = (id) => {
    setCart(prev => {
      const item = prev.find(i => i._id === id);
      if (item.quantity === 1) return prev.filter(i => i._id !== id);
      return prev.map(i => i._id === id ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const setQuantity = (id, quantity) => {
    setCart(prev => prev.map(i => i._id === id ? { ...i, quantity: Math.max(1, quantity) } : i));
  };

  const getTotalItems = () => cart.reduce((sum, i) => sum + i.quantity, 0);
  const getTotalPrice = () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, incrementItem, decrementItem, setQuantity, getTotalItems, getTotalPrice }}>
      {children}
    </CartContext.Provider>
  );
};