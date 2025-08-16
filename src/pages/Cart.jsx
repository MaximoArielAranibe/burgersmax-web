// src/pages/Cart.jsx
import React, { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import '../styles/Cart.scss';

function buildReadyAtISO(timeStr) {
  // timeStr: "HH:MM"
  if (!timeStr) return null;
  const now = new Date();
  const [hh, mm] = timeStr.split(':').map(Number);
  const d = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    isNaN(hh) ? 0 : hh,
    isNaN(mm) ? 0 : mm,
    0,
    0
  );
  return d.toISOString();
}

const Cart = () => {
  const {
    cart, removeFromCart, clearCart,
    subtotal, costoEnvio, checkout
  } = useCart();

  // NUEVOS CONTROLES
  const [includeEnvio, setIncludeEnvio] = useState(false);
  const [readyTime, setReadyTime] = useState(''); // type="time" => "HH:MM"
  const [paid, setPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo'); // default

  const envioCalc = includeEnvio && cart.length > 0 ? costoEnvio : 0;
  const totalCalc = useMemo(() => subtotal + envioCalc, [subtotal, envioCalc]);

  const [lastOrder, setLastOrder] = useState(null);

  const handleCheckout = () => {
    const order = checkout({
      buyer: { nombre: 'Invitado' },
      includeEnvio,
      readyAt: buildReadyAtISO(readyTime),
      paid,
      paymentMethod: paid ? paymentMethod : null
    });
    if (order) setLastOrder(order);
  };

  if (cart.length === 0 && !lastOrder) {
    return (
      <div className='cart'>
        <h2>Carrito de Compras</h2>
        <p>El carrito está vacío</p>
      </div>
    );
  }

  return (
    <div className='cart'>
      <h2>Carrito de Compras</h2>

      {cart.length > 0 && (
        <>
          <ul>
            {cart.map((item, index) => (
              <li key={`${item.id}-${item.tipo}-${index}`}>
                <img className='cart__item--img' src={item.thumbnail} alt={item.name} />
                <strong>{item.name}</strong> - {item.tipo} - ${item.precio} x {item.quantity} = ${item.precio * item.quantity}
                <button onClick={() => removeFromCart(item.id, item.tipo)}>Eliminar</button>
              </li>
            ))}
          </ul>

          {/* CONTROLES NUEVOS */}
          <div className="cart__options">
            <label className="opt">
              <input
                type="checkbox"
                checked={includeEnvio}
                onChange={(e) => setIncludeEnvio(e.target.checked)}
              />
              Agregar envío (${costoEnvio})
            </label>

            <label className="opt">
              Hora de entrega / listo:
              <input
                type="time"
                value={readyTime}
                onChange={(e) => setReadyTime(e.target.value)}
              />
            </label>

            <label className="opt">
              <input
                type="checkbox"
                checked={paid}
                onChange={(e) => setPaid(e.target.checked)}
              />
              Pagado
            </label>

            <label className="opt">
              Método de pago:
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={!paid}
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </label>
          </div>

          <div className="cart__totals">
            <p>Subtotal: ${subtotal}</p>
            <p>Envío: ${envioCalc}</p>
            <p><b>Total: ${totalCalc}</b></p>
          </div>

          <div className="cart__actions">
            <button onClick={clearCart} className="btn-danger">Vaciar carrito</button>
            <button onClick={handleCheckout} className="btn-primary">Comprar</button>
          </div>
        </>
      )}

      {lastOrder && (
        <div className="order-confirm">
          <h3>¡Gracias por tu compra!</h3>
          <p>Nº de orden: <b>{lastOrder.id}</b></p>

          {lastOrder.logistics?.readyAt && (
            <p>
              Hora lista:{" "}
              <b>{new Date(lastOrder.logistics.readyAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</b>
            </p>
          )}
          <p>
            Envío: <b>{lastOrder.logistics?.includeEnvio ? 'Sí' : 'No'}</b>
          </p>
          <p>
            Pagado: <b>{lastOrder.payment?.paid ? 'Sí' : 'No'}</b>
            {lastOrder.payment?.paid && lastOrder.payment?.method && (
              <> — Método: <b>{lastOrder.payment.method}</b></>
            )}
          </p>

          <ul>
            {lastOrder.items.map(it => (
              <li key={`${it.id}-${it.tipo}`}>
                {it.name} - {it.tipo} x {it.quantity} = ${it.subtotal}
              </li>
            ))}
          </ul>
          <p>Subtotal: ${lastOrder.summary.subtotal}</p>
          <p>Envío: ${lastOrder.summary.envio}</p>
          <p><b>Total: ${lastOrder.summary.total}</b></p>
        </div>
      )}
    </div>
  );
};

export default Cart;
