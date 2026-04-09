// src/context/CartContext.jsx
import { createContext, useMemo } from 'react';
import { usePersistentState } from '../hooks/usePersistentSate';
import { normalizeItem, skuOf, cartItemToOrderItem } from '../domain/cart';

import { useContext } from 'react';

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }

  return context;
};



const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // ---------- Persistencia versionada ----------
  const [cart, setCart] = usePersistentState(
    'cart:v1',
    [],
    (arr) => arr.map(normalizeItem).filter(i => i.quantity > 0)
  );

  const [orders, setOrders] = usePersistentState('orders:v1', [], (v) => v || []);
  const [orderCounter, setOrderCounter] = usePersistentState('orderCounter:v1', 0, Number);

  const costoEnvio = 2000;

  // ---------- Derivados ----------
  const subtotal = useMemo(
    () => cart.reduce((a, i) => a + i.precio * i.quantity, 0),
    [cart]
  );

  const itemCount = useMemo(
    () => cart.reduce((a, i) => a + i.quantity, 0),
    [cart]
  );

  // ---------- Carrito ----------
  const addToCart = (product) => {
    const p = normalizeItem(product);
    setCart(prev => {
      const idx = prev.findIndex(i => i.sku === skuOf(p));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, p];
    });
  };

  const removeFromCart = (id, tipo) => {
    const key = `${id}:${tipo ?? 'base'}`;
    setCart(prev =>
      prev
        .map(i => i.sku === key ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  // ---------- Checkout ----------
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
    const newNumber = Number(orderCounter) + 1;

    const order = {
      id: `ORD-${newNumber}`,
      number: newNumber,
      createdAt: new Date().toISOString(),
      buyer,
      items: cart.map(cartItemToOrderItem),
      summary: { subtotal, envio, total },
      logistics: { includeEnvio, readyAt },
      payment: { paid: !!paid, method: paid ? paymentMethod : null },
      note,
      status: 'CREATED',
    };

    setOrders(prev => [order, ...prev]);
    setOrderCounter(newNumber);
    setCart([]); // atómico respecto al snapshot actual
    return order;
  };

  // ---------- Gestión pedidos ----------
  const deleteOrder = (orderId) =>
    setOrders(prev => prev.filter(o => o.id !== orderId));

  const deleteAllOrders = () => setOrders([]);

  const updateOrderNote = (orderId, newNote) =>
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, note: newNote } : o))
    );

  const updateOrderStatus = (orderId, status) =>
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status } : o))
    );

  const updateOrderPayment = (orderId, paid, method = null) =>
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          payment: {
            paid: !!paid,
            method: paid ? (method || o.payment?.method || 'efectivo') : null
          }
        };
      })
    );

  const toggleOrderPaid = (orderId) =>
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const nextPaid = !o.payment?.paid;
        return {
          ...o,
          payment: {
            paid: nextPaid,
            method: nextPaid ? (o.payment?.method || 'efectivo') : null
          }
        };
      })
    );

  const updateOrderShipping = (orderId, includeEnvio) =>
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const subtotalSafe =
          o.summary?.subtotal ??
          o.items.reduce((a, it) => a + it.unitPrice * it.quantity, 0);
        const envio = includeEnvio ? costoEnvio : 0;
        return {
          ...o,
          logistics: { ...(o.logistics || {}), includeEnvio },
          summary: { subtotal: subtotalSafe, envio, total: subtotalSafe + envio }
        };
      })
    );

  const updateOrderAddress = (orderId, patch) =>
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, buyer: { ...(o.buyer || {}), ...patch } }
          : o
      )
    );

  const value = useMemo(() => ({
    cart,
    itemCount,
    subtotal,
    costoEnvio,
    addToCart,
    removeFromCart,
    clearCart,
    orders,
    checkout,
    deleteOrder,
    deleteAllOrders,
    updateOrderNote,
    updateOrderStatus,
    updateOrderPayment,
    toggleOrderPaid,
    updateOrderShipping,
    updateOrderAddress
  }), [cart, itemCount, subtotal, orders]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};


export default CartContext;