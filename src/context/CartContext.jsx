// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Carrito con persistencia
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; }
    catch { return []; }
  });

  // Pedidos y contador con persistencia
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('orders')) || []; }
    catch { return []; }
  });

  const [orderCounter, setOrderCounter] = useState(() => {
    try { return JSON.parse(localStorage.getItem('orderCounter')) || 0; }
    catch { return 0; }
  });

  const costoEnvio = 2000;

  // Persistencia en localStorage
  useEffect(() => localStorage.setItem('cart', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('orders', JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem('orderCounter', JSON.stringify(orderCounter)), [orderCounter]);

  // ------------------ Carrito ------------------
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id && i.tipo === product.tipo);
      return existing
        ? prev.map(i => i.id === product.id && i.tipo === product.tipo
            ? { ...i, quantity: i.quantity + 1 }
            : i)
        : [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id, tipo) => {
    setCart(prev =>
      prev
        .map(i => i.id === id && i.tipo === tipo ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((acc, i) => acc + i.precio * i.quantity, 0);

  // ------------------ Checkout / Pedidos ------------------
  const checkout = (options = {}) => {
    if (!cart.length) return null;

    const {
      buyer = { nombre: 'Invitado' },
      includeEnvio = false,
      readyAt = null,
      paid = false,
      paymentMethod = null,
      note = ''
    } = options;

    const envio = includeEnvio ? costoEnvio : 0;
    const total = subtotal + envio;
    const newNumber = orderCounter + 1;

    const order = {
      id: `ORD-${newNumber}`,
      number: newNumber,
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
      logistics: { includeEnvio, readyAt },
      payment: { paid, method: paid ? paymentMethod : null },
      note,
      status: 'CREATED',
    };

    setOrders(prev => [order, ...prev]);
    setOrderCounter(newNumber);
    clearCart();
    return order;
  };

  // ------------------ Gestión de pedidos ------------------
  const deleteOrder = (orderId) => setOrders(prev => prev.filter(o => o.id !== orderId));
  const deleteAllOrders = () => setOrders([]);
  const updateOrderNote = (orderId, newNote) =>
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, note: newNote } : o));

  const updateOrderStatus = (orderId, status) =>
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));

  const updateOrderPayment = (orderId, paid, method = null) =>
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return { ...o, payment: { paid: !!paid, method: paid ? (method || o.payment?.method || 'efectivo') : null } };
    }));

  const toggleOrderPaid = (orderId) =>
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const nextPaid = !o.payment?.paid;
      return { ...o, payment: { paid: nextPaid, method: nextPaid ? (o.payment?.method || 'efectivo') : null } };
    }));

  const updateOrderShipping = (orderId, includeEnvio) =>
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const subtotal = o.summary?.subtotal ?? o.items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
      const envio = includeEnvio ? costoEnvio : 0;
      return {
        ...o,
        logistics: { ...(o.logistics || {}), includeEnvio },
        summary: { subtotal, envio, total: subtotal + envio },
      };
    }));

  const updateOrderAddress = (orderId, patch) =>
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, buyer: { ...(o.buyer || {}), ...patch } } : o));

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, clearCart,
      subtotal, costoEnvio,
      orders, checkout,
      deleteOrder, deleteAllOrders, updateOrderNote,
      updateOrderStatus, updateOrderPayment, toggleOrderPaid,
      updateOrderShipping, updateOrderAddress
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
