// src/pages/Cart.jsx
import React, { useMemo, useRef, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import '../styles/Cart.scss';

function buildReadyAtISO(timeStr) {
  if (!timeStr) return null;
  const now = new Date();
  const [hh, mm] = timeStr.split(':').map(Number);
  const d = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    isNaN(hh) ? 0 : hh,
    isNaN(mm) ? 0 : mm,
    0, 0
  );
  return d.toISOString();
}

const Cart = () => {
  const { cart, removeFromCart, clearCart, subtotal, costoEnvio, checkout } = useCart();

  // Opciones de compra
  const [includeEnvio, setIncludeEnvio] = useState(false);
  const [readyTime, setReadyTime] = useState('');
  const [paid, setPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [note, setNote] = useState('');

  // Datos de envío (solo si includeEnvio)
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [formError, setFormError] = useState('');
  const addressRef = useRef(null);

  const envioCalc = includeEnvio && cart.length > 0 ? costoEnvio : 0;
  const totalCalc = useMemo(() => subtotal + envioCalc, [subtotal, envioCalc]);

  const [lastOrder, setLastOrder] = useState(null);

  const handleCheckout = () => {
    // Validación: si quiere envío, la dirección es obligatoria
    if (includeEnvio && buyerAddress.trim() === '') {
      setFormError('Ingresá una dirección para el envío.');
      addressRef.current?.focus();
      return;
    }
    setFormError('');

    const order = checkout({
      buyer: {
        nombre: buyerName?.trim() || 'Invitado',
        telefono: buyerPhone?.trim() || '',
        direccion: includeEnvio ? buyerAddress.trim() : '',
        nota: note?.trim() || ''
      },
      includeEnvio,
      readyAt: buildReadyAtISO(readyTime),
      paid,
      paymentMethod: paid ? paymentMethod : null,
      note
    });

    if (order) {
      setLastOrder(order);
      // limpiar formulario (opcional)
      setIncludeEnvio(false);
      setReadyTime('');
      setPaid(false);
      setPaymentMethod('efectivo');
      setNote('');
      setBuyerName('');
      setBuyerPhone('');
      setBuyerAddress('');
    }
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

          {/* Opciones */}
          <div className="cart__options">
            <label className="opt">
              <input
                type="checkbox"
                checked={includeEnvio}
                onChange={(e) => setIncludeEnvio(e.target.checked)}
              />
              Agregar envío (${costoEnvio})
            </label>

            {includeEnvio && (
              <>
                <label className="opt opt--full">
                  Dirección de entrega *
                  <input
                    ref={addressRef}
                    type="text"
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    placeholder="Calle 123, depto 4B, barrio…"
                    aria-invalid={!!formError}
                    aria-describedby="addr-error"
                  />
                </label>

                <div className="cart__two">
                  <label className="opt">
                    Nombre del receptor
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="Nombre y apellido"
                    />
                  </label>

                  <label className="opt">
                    Teléfono
                    <input
                      type="tel"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="Ej: 11 5555 5555"
                    />
                  </label>
                </div>

                {formError && (
                  <p id="addr-error" className="form-error">{formError}</p>
                )}
              </>
            )}

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

            <label className="opt opt--full">
              Comentarios / Nota del pedido:
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Sin cebolla, extra cheddar, dejar en portería, etc."
              />
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
          <p>Nº de orden: <b>#{lastOrder.number}</b></p>

          {lastOrder.logistics?.readyAt && (
            <p>
              Hora lista:{" "}
              <b>{new Date(lastOrder.logistics.readyAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</b>
            </p>
          )}

          <p>
            Envío: <b>{lastOrder.logistics?.includeEnvio ? 'Sí' : 'No'}</b>
          </p>

          {lastOrder.logistics?.includeEnvio && (
            <p>
              Entrega a: <b>{lastOrder.buyer?.nombre || 'Invitado'}</b>
              {lastOrder.buyer?.telefono ? ` — ${lastOrder.buyer.telefono}` : ''}
              <br />
              {lastOrder.buyer?.direccion}
            </p>
          )}

          <p>
            Pagado: <b>{lastOrder.payment?.paid ? 'Sí' : 'No'}</b>
            {lastOrder.payment?.paid && lastOrder.payment?.method && (
              <> — Método: <b>{lastOrder.payment.method}</b></>
            )}
          </p>

          {lastOrder.note && (
            <p><b>Nota:</b> {lastOrder.note}</p>
          )}

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
