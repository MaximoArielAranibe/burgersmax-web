// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('orders')) || []; } catch { return []; }
  });
  const [orderCounter, setOrderCounter] = useState(() => {
    try { return JSON.parse(localStorage.getItem('orderCounter')) || 0; } catch { return 0; }
  });

  const costoEnvio = 2000;

  // Persistencia
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('orderCounter', JSON.stringify(orderCounter));
  }, [orderCounter]);

  // Carrito
  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id && i.tipo === product.tipo);
      return ex
        ? prev.map(i => (i.id === product.id && i.tipo === product.tipo)
            ? { ...i, quantity: i.quantity + 1 }
            : i)
        : [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id, tipo) => {
    setCart(prev =>
      prev
        .map(i => (i.id === id && i.tipo === tipo) ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  // Totales del carrito (sin envío; el envío se decide al hacer checkout)
  const subtotal = cart.reduce((acc, i) => acc + i.precio * i.quantity, 0);

  /**
   * checkout(options)
   * options = {
   *   buyer?: { nombre, telefono, direccion, nota }
   *   includeEnvio?: boolean
   *   readyAt?: string ISO (p.ej: '2025-08-16T20:30:00-03:00' o null)
   *   paid?: boolean
   *   paymentMethod?: 'efectivo' | 'transferencia' | null
   * }
   */
  const checkout = (options = {}) => {
    if (!cart.length) return null;

    const {
      buyer = { nombre: 'Invitado' },
      includeEnvio = false,
      readyAt = null,
      paid = false,
      paymentMethod = null,
    } = options;

    const envio = includeEnvio ? costoEnvio : 0;
    const total = subtotal + envio;

    const newNumber = orderCounter + 1;

    const order = {
      id: `ORD-${newNumber}`,   // ID legible
      number: newNumber,        // número incremental (#1, #2, ...)
      createdAt: new Date().toISOString(),
      buyer,
      items: cart.map(i => ({
        id: i.id,
        name: i.name,
        tipo: i.tipo,
        unitPrice: i.precio,
        quantity: i.quantity,
        subtotal: i.precio * i.quantity,
        thumbnail: i.thumbnail ?? null,
      })),
      summary: { subtotal, envio, total },
      logistics: {
        includeEnvio,
        readyAt, // ISO string o null
      },
      payment: {
        paid,
        method: paid ? paymentMethod : null,
      },
      status: 'CREATED',
    };

    setOrders(prev => [order, ...prev]);
    setOrderCounter(newNumber);
    clearCart();
    return order;
  };

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, clearCart,
      costoEnvio, subtotal,
      orders, checkout
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
