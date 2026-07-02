// src/pages/Cart.jsx
import { useMemo, useRef, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import '../styles/Cart.scss';
import { printOrder } from '../services/printer.js';

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
    0,
    0
  );
  return d.toISOString();
}

const Cart = () => {
  const { cart, removeFromCart, clearCart, subtotal, costoEnvio, checkout } = useCart();

  // Opciones
  const [includeEnvio, setIncludeEnvio] = useState(false);
  const [readyTime, setReadyTime] = useState('');
  const [paid, setPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [cashAmount, setCashAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [note, setNote] = useState('');

  // Datos cliente
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [formError, setFormError] = useState('');
  const addressRef = useRef(null);

  // costos disponibles
  const ENVIO_OPTIONS = [2000, 2500, 3000, 3500, 4000];

  const [envioCost, setEnvioCost] = useState(ENVIO_OPTIONS[0]);

  const envioCalc =
    includeEnvio && cart.length > 0
      ? envioCost
      : 0;

  const totalCalc = useMemo(
    () => subtotal + envioCalc,
    [subtotal, envioCalc]
  );

  const mixedTotal =
    Number(cashAmount || 0) +
    Number(transferAmount || 0);

  const remaining =
    Math.max(totalCalc - mixedTotal, 0);

  const paymentCompleted =
    paymentMethod !== "mixto" ||
    remaining === 0;



  const [lastOrder, setLastOrder] = useState(null);

  // ✅ CHECKOUT + IMPRESIÓN
  const handleCheckout = async () => {

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

        direccion: includeEnvio
          ? buyerAddress.trim()
          : '',

        nota: note?.trim() || ''

      },

      includeEnvio,

      envioCost, // 🔥 guardamos el costo elegido

      readyAt: buildReadyAtISO(readyTime),

      paid,

      paymentMethod: paid ? paymentMethod : null,

      payment: paid
        ? {
          method: paymentMethod,
          cash:
            paymentMethod === "mixto"
              ? Number(cashAmount)
              : paymentMethod === "efectivo"
                ? totalCalc
                : 0,
          transfer:
            paymentMethod === "mixto"
              ? Number(transferAmount)
              : paymentMethod === "transferencia"
                ? totalCalc
                : 0,
        }
        : null,

      note

    });

    if (order) {

      setLastOrder(order);

      // 🔥 imprimir ticket
      await printOrder(order);

      // limpiar form
      setIncludeEnvio(false);

      setEnvioCost(ENVIO_OPTIONS[0]);

      setReadyTime('');

      setPaid(false);

      setCashAmount('');

      setTransferAmount('');

      setPaymentMethod('efectivo');

      setNote('');

      setBuyerName('');

      setBuyerPhone('');

      setBuyerAddress('');

    }

  };

  // 👉 carrito vacío
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

                <img
                  className='cart__item--img'
                  src={item.thumbnail}
                  alt={item.name}
                />

                <strong>{item.name}</strong>

                {" - "}{item.tipo}

                {" - $"}{Number(item.precio) || 0}

                {" x "}{Number(item.quantity) || 0}

                {" = $"}

                {(Number(item.precio) || 0) * (Number(item.quantity) || 0)}

                <button
                  onClick={() =>
                    removeFromCart(item.id, item.tipo)
                  }
                >

                  Eliminar

                </button>

              </li>

            ))}

          </ul>


          {/* OPCIONES */}

          <div className="cart__options">



            {includeEnvio && (

              <label className="opt">

                Costo envío

                <select
                  value={envioCost}
                  onChange={(e) =>
                    setEnvioCost(Number(e.target.value))
                  }
                >

                  {ENVIO_OPTIONS.map(v => (

                    <option key={v} value={v}>
                      ${v}
                    </option>

                  ))}

                </select>

              </label>

            )}


            <div className="cart__two">

              <label className="opt">

                Nombre

                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) =>
                    setBuyerName(e.target.value)
                  }
                />

              </label>


              <label className="opt">

                Teléfono

                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) =>
                    setBuyerPhone(e.target.value)
                  }
                />

              </label>

            </div>


            {includeEnvio && (

              <>

                <label className="opt opt--full">

                  Dirección *

                  <input
                    ref={addressRef}
                    type="text"
                    value={buyerAddress}
                    onChange={(e) =>
                      setBuyerAddress(e.target.value)
                    }
                  />

                </label>


                {formError && (

                  <p className="form-error">

                    {formError}

                  </p>

                )}

              </>

            )}


            <label className="opt">

              Hora:

              <input
                type="time"
                value={readyTime}
                onChange={(e) =>
                  setReadyTime(e.target.value)
                }
              />

            </label>


            <label className="opt">

              <input
                type="checkbox"
                checked={paid}
                onChange={(e) =>
                  setPaid(e.target.checked)
                }
              />

              Pagado


            </label>

            {paid && (
              <>
                <label className="opt">

                  Método:

                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="mixto">Mixto (Efectivo + Transferencia)</option>
                  </select>

                </label>

                {paymentMethod === "mixto" && (

                  <div className="cart__mixed-payment">

                    <label className="opt">

                      Efectivo

                      <input
                        type="number"
                        min="0"
                        value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value)}
                      />

                    </label>

                    <label className="opt">

                      Transferencia

                      <input
                        type="number"
                        min="0"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                      />

                    </label>

                    <div className="cart__payment-summary">

                      <p>
                        Total: <strong>${totalCalc}</strong>
                      </p>

                      <p>
                        Pagado: <strong>${mixedTotal}</strong>
                      </p>

                      <p>
                        Restante: <strong>${remaining}</strong>
                      </p>

                    </div>

                  </div>

                )}

              </>
            )}



            <label className="opt opt--full">

              Nota:

              <textarea
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
              />

            </label>

          </div>


          {/* TOTALES */}

          <div className="cart__totals">

            <p>

              Subtotal: ${subtotal}

            </p>

            <p>

              Envío: ${envioCalc}

            </p>

            <p>

              <b>

                Total: ${totalCalc}

              </b>

            </p>

          </div>


          {/* ACCIONES */}

          <div className="cart__actions">

            <button
              onClick={clearCart}
              className="btn-danger"
            >

              Vaciar carrito

            </button>


            <button
              onClick={handleCheckout}
              className="btn-primary"
              disabled={!paymentCompleted}
            >
              Comprar
            </button>

          </div>

        </>

      )}


      {/* CONFIRMACIÓN */}

      {lastOrder && (

        <div className="order-confirm">

          <h3>

            ¡Gracias por tu compra!

          </h3>

          <p>

            Nº orden:

            <b> #{lastOrder.number}</b>

          </p>

          <p>

            Total:

            <b> ${lastOrder.summary.total}</b>

          </p>

        </div>

      )}

    </div>

  );

};

export default Cart;