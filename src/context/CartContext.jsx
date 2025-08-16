// src/context/CartContext.jsx
import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const costoEnvio = 2000;

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        item => item.id === product.id && item.tipo === product.tipo
      );

      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id && item.tipo === product.tipo
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };


  const removeFromCart = (id, tipo) => {
    setCart((prevCart) =>
      prevCart
        .map(item =>
          item.id === id && item.tipo === tipo
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };


  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce((acc, item) => acc + item.precio * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, costoEnvio, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
