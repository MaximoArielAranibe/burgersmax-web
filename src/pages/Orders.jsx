import { useState, useMemo } from "react";
import { useCart } from "../context/CartContext.jsx";
import { printOrder } from "../services/printer.js";
import "../styles/orders.scss";

/* helpers */

const fmt = (n) =>
  Number(n || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
  });

const fdate = (iso) =>
  new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const normalizeStatus = (s) =>
  s === "FINISHED" ? "FINISHED" : "PENDING";

const statusLabel = (s) =>
  s === "FINISHED" ? "FINALIZADO" : "PENDIENTE";

const totalBurgersCount = (items) =>
  items.reduce((acc, it) => {
    if (it.tipo) acc += it.quantity;
    return acc;
  }, 0);

const calcMedallones = (items) =>
  items.reduce((acc, it) => {
    if (it.tipo === "simple") acc += 1 * it.quantity;
    if (it.tipo === "doble") acc += 2 * it.quantity;
    if (it.tipo === "triple") acc += 3 * it.quantity;
    return acc;
  }, 0);

const totalFries = (items) =>
  items.reduce((acc, it) => {
    if (it.name.toLowerCase().includes("papas"))
      acc += it.quantity;
    return acc;
  }, 0);

const totalLomos = (items) =>
  items.reduce((acc, it) => {
    if (it.name.toLowerCase().includes("lomo"))
      acc += it.quantity;
    return acc;
  }, 0);

/* costos disponibles */

const ENVIO_OPTIONS = [2000, 2500, 3000, 3500];

export default function Orders() {

  const {
    orders,
    deleteOrder,
    deleteAllOrders,
    toggleOrderPaid,
    updateOrderStatus,
    updateOrderShipping,
    updateOrderAddress,
    updateOrderNote,
    updateOrderPayment,
    updateOrderShippingCost // 👈 debe existir en el context
  } = useCart();

  const [noteDraft, setNoteDraft] = useState({});
  const [addrDraft, setAddrDraft] = useState({});
  const [envioDraft, setEnvioDraft] = useState({});

  const totalGlobal = useMemo(() =>
    orders.reduce((acc, o) => acc + (o.summary?.total || 0), 0)
    , [orders]);

  const totalBurgersGlobal = useMemo(() =>
    orders.reduce((acc, o) => acc + totalBurgersCount(o.items), 0)
    , [orders]);

  const handleReprint = async (order) => {

    // buscamos la orden actualizada del context

    const updated = orders.find(o => o.id === order.id);

    await printOrder(updated);

  };
  const saveAddress = (o) => {

    const d = addrDraft[o.id];

    updateOrderAddress(o.id, {

      nombre: d?.nombre ?? o.buyer?.nombre ?? "",
      telefono: d?.telefono ?? o.buyer?.telefono ?? "",
      direccion: d?.direccion ?? o.buyer?.direccion ?? "",

    });

  };

  const handleEnvioChange = (order, value) => {

    const cost = Number(value);

    // actualiza UI inmediata
    setEnvioDraft(prev => ({
      ...prev,
      [order.id]: cost
    }));

    // actualiza context (persistente)
    updateOrderShippingCost(order.id, cost);

  };

  if (!orders.length)

    return (

      <section className="orders empty">

        <h2>Pedidos</h2>
        <p>No hay pedidos todavía</p>

      </section>

    );

  return (

    <section className="orders">

      <div className="ordersTop">

        <div>

          <h2>Pedidos</h2>

          <div className="globalStats">

            <div>

              ventas
              <b>${fmt(totalGlobal)}</b>

            </div>

            <div>

              hamburguesas
              <b>{totalBurgersGlobal}</b>

            </div>

          </div>

        </div>

        <button
          className="btn danger"
          onClick={deleteAllOrders}
        >
          borrar todo
        </button>

      </div>


      <div className="ordersGrid">

        {orders.map(o => {

          const status = normalizeStatus(o.status);
          const paid = !!o.payment?.paid;
          const method = o.payment?.method || "efectivo";

          const includeEnvio =
            !!o.logistics?.includeEnvio;

          const envioActual =
            envioDraft[o.id] ??
            o.summary?.envio ??
            ENVIO_OPTIONS[0];

          const burgers = totalBurgersCount(o.items);
          const medallones = calcMedallones(o.items);
          const fries = totalFries(o.items);
          const lomos = totalLomos(o.items);

          return (

            <div
              key={o.id}
              className={`orderCard ${status}`}
            >

              <div className="cardHeader">

                <div>

                  <div className="orderNumber">
                    #{o.number}
                  </div>

                  <div className="orderTime">
                    {fdate(o.createdAt)}
                  </div>

                </div>

                <div className={`status ${status}`}>
                  {statusLabel(status)}
                </div>

              </div>


              {/* cliente */}

              <div className="clientBox">

                <div className="clientMain">

                  <div className="clientName">
                    {o.buyer?.nombre || "Cliente"}
                  </div>

                  {o.buyer?.telefono && (
                    <div className="clientPhone">
                      {o.buyer.telefono}
                    </div>
                  )}

                </div>

                {includeEnvio && o.buyer?.direccion && (

                  <div className="clientAddress">
                    {o.buyer.direccion}
                  </div>

                )}

              </div>


              {/* stats */}

              <div className="stats">

                {burgers > 0 && <span>🍔 {burgers}</span>}
                {medallones > 0 && <span>🥩 {medallones}</span>}
                {fries > 0 && <span>🍟 {fries}</span>}
                {lomos > 0 && <span>🥪 {lomos}</span>}

              </div>


              {/* items */}

              <div className="items">

                {o.items.map(it => (

                  <div
                    key={`${o.id}-${it.id}-${it.tipo}`}
                    className="item"
                  >

                    <span className="qty">
                      {it.quantity}x
                    </span>

                    <span className="iname">

                      {it.name}

                      {it.tipo &&
                        <small>{it.tipo}</small>
                      }

                    </span>

                    <span className="price">
                      ${fmt(it.subtotal)}
                    </span>

                  </div>

                ))}

              </div>


              {/* nota */}
              <p style={{ color: "black" }}>Notas</p>
              <textarea

                placeholder="nota..."

                value={noteDraft[o.id] ?? o.note ?? ""}

                onChange={e =>
                  setNoteDraft(prev => ({
                    ...prev,
                    [o.id]: e.target.value
                  }))
                }

              />

              <button
                className="btn"
                onClick={() =>
                  updateOrderNote(o.id, noteDraft[o.id])
                }
              >
                guardar nota
              </button>


              {/* envio */}

              <div>
                <label className="check">

                  <input
                    type="checkbox"
                    checked={includeEnvio}
                    onChange={e =>
                      updateOrderShipping(o.id, e.target.checked)
                    }
                  />

                  envio

                </label>


                {includeEnvio && (

                  <div className="envioBox">

                    <label>

                      costo envío

                      <select

                        value={envioActual}

                        onChange={(e) =>
                          handleEnvioChange(o, e.target.value)
                        }

                      >

                        {ENVIO_OPTIONS.map(v => (

                          <option key={v} value={v}>
                            ${v}
                          </option>

                        ))}

                      </select>

                    </label>

                  </div>

                )}

              </div>

              {/* direccion */}

              {includeEnvio && (

                <div className="addressBox">

                  <input
                    placeholder="direccion"
                    value={addrDraft[o.id]?.direccion ?? o.buyer?.direccion ?? ""}
                    onChange={e =>
                      setAddrDraft(p => ({
                        ...p,
                        [o.id]: {
                          ...p[o.id],
                          direccion: e.target.value
                        }
                      }))
                    }
                  />

                  <input
                    placeholder="nombre"
                    value={addrDraft[o.id]?.nombre ?? o.buyer?.nombre ?? ""}
                    onChange={e =>
                      setAddrDraft(p => ({
                        ...p,
                        [o.id]: {
                          ...p[o.id],
                          nombre: e.target.value
                        }
                      }))
                    }
                  />

                  <input
                    placeholder="telefono"
                    value={addrDraft[o.id]?.telefono ?? o.buyer?.telefono ?? ""}
                    onChange={e =>
                      setAddrDraft(p => ({
                        ...p,
                        [o.id]: {
                          ...p[o.id],
                          telefono: e.target.value
                        }
                      }))
                    }
                  />

                  <button
                    className="btn"
                    onClick={() => saveAddress(o)}
                  >
                    guardar datos
                  </button>

                </div>

              )}


              {/* controles */}

              <div className="controls">

                <button
                  className="btn print"
                  onClick={() => handleReprint(o)}
                >
                  imprimir
                </button>

                <label className="check">

                  <input
                    type="checkbox"
                    checked={paid}
                    onChange={() =>
                      toggleOrderPaid(o.id)
                    }
                  />

                  pagado

                </label>

                <select
                  value={method}
                  onChange={e =>
                    updateOrderPayment(
                      o.id,
                      true,
                      e.target.value
                    )
                  }
                >
                  <option value="efectivo">efectivo</option>
                  <option value="transferencia">transferencia</option>
                </select>

                <select
                  value={status}
                  onChange={e =>
                    updateOrderStatus(o.id, e.target.value)
                  }
                >
                  <option value="PENDING">pendiente</option>
                  <option value="FINISHED">finalizado</option>
                </select>

                <button
                  className="btn danger"
                  onClick={() => deleteOrder(o.id)}
                >
                  eliminar
                </button>

              </div>


              <div className="priceBox">

                <div className="priceLine">

                  <span>Subtotal productos</span>

                  <span>
                    ${fmt(o.summary?.subtotal)}
                  </span>

                </div>


                {includeEnvio && (

                  <div className="priceLine envio">

                    <span>Envío</span>

                    <span>
                      ${fmt(envioActual)}
                    </span>

                  </div>

                )}


                <div className="priceTotal">

                  <span>TOTAL</span>

                  <span>
                    ${fmt(
                      (o.summary?.subtotal || 0) +
                      (includeEnvio ? envioActual : 0)
                    )}
                  </span>

                </div>

              </div>
            </div>

          );

        })}

      </div>

    </section>

  );

}