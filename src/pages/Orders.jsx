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
  s === "FINISHED" ? "Finalizado" : "Pendiente";

const totalBurgersCount = (items) =>
  items.reduce((acc, it) => {
    if (it.tipo) acc += Number(it.quantity || 0);
    return acc;
  }, 0);

const calcMedallones = (items) =>
  items.reduce((acc, it) => {
    if (it.tipo === "simple") acc += 1 * it.quantity;
    if (it.tipo === "doble") acc += 2 * it.quantity;
    if (it.tipo === "triple") acc += 3 * it.quantity;
    return acc;
  }, 0);

const totalFriesIndividual = (items) =>
  items.reduce((acc, it) => {
    if (it.name.toLowerCase().includes("papas")) {
      if (!it.name.toLowerCase().includes("bandeja"))
        acc += it.quantity;
    }
    return acc;
  }, 0);

const totalFriesTray = (items) =>
  items.reduce((acc, it) => {
    if (it.name.toLowerCase().includes("bandeja"))
      acc += it.quantity;
    return acc;
  }, 0);

const totalLomosCount = (items) =>
  items.reduce((acc, it) => {
    if (it.name.toLowerCase().includes("lomo"))
      acc += it.quantity;
    return acc;
  }, 0);

/* componente */

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
  } = useCart();

  const [noteDraft, setNoteDraft] = useState({});
  const [addrDraft, setAddrDraft] = useState({});

  /* resumen global */

  const totalGlobal = useMemo(
    () =>
      orders.reduce(
        (acc, o) => acc + Number(o.summary?.total || 0),
        0
      ),
    [orders]
  );

  const totalBurgersGlobal = useMemo(
    () =>
      orders.reduce(
        (acc, o) => acc + totalBurgersCount(o.items),
        0
      ),
    [orders]
  );

  /* acciones */

  const handleDelete = (id) => {
    if (confirm("Eliminar pedido?")) deleteOrder(id);
  };

  const handleDeleteAll = () => {
    if (confirm("Eliminar TODOS los pedidos?"))
      deleteAllOrders();
  };

  const handleReprint = async (order) => {
    try {
      await printOrder(order);
    } catch (err) {
      console.error(err);
      alert("Error al imprimir");
    }
  };

  const saveAddress = (o) => {
    const d = addrDraft[o.id];

    updateOrderAddress(o.id, {
      nombre: d?.nombre ?? o.buyer?.nombre ?? "",
      telefono: d?.telefono ?? o.buyer?.telefono ?? "",
      direccion: d?.direccion ?? o.buyer?.direccion ?? "",
    });
  };

  if (!orders?.length)
    return (
      <section className="orders">
        <h2>Pedidos</h2>
        <p>No hay pedidos todavía</p>
      </section>
    );

  return (
    <section className="orders">

      <div className="orders__header">

        <h2>Pedidos</h2>

        <div className="orders__summaryGlobal">

          <span>
            Ventas totales
            <b>${fmt(totalGlobal)}</b>
          </span>

          <span>
            Hamburguesas
            <b>{totalBurgersGlobal}</b>
          </span>

        </div>

        <button
          className="btn btn-danger"
          onClick={handleDeleteAll}
        >
          eliminar todos
        </button>

      </div>

      <ul className="orders__grid">

        {orders.map((o) => {

          const status = normalizeStatus(o.status);
          const paid = !!o.payment?.paid;
          const method = o.payment?.method || "efectivo";
          const includeEnvio =
            !!o.logistics?.includeEnvio;

          const totalBurgers =
            totalBurgersCount(o.items);

          const totalMedallones =
            calcMedallones(o.items);

          const fries =
            totalFriesIndividual(o.items);

          const bandejas =
            totalFriesTray(o.items);

          const lomos =
            totalLomosCount(o.items);

          return (

            <li key={o.id} className="orderCard">

              {/* header */}

              <div className="orderCard__top">

                <div>

                  <div className="orderCard__number">
                    #{o.number}
                  </div>

                  <div className="orderCard__time">
                    {fdate(o.createdAt)}
                  </div>

                </div>

                <div
                  className={`badge badge--${status}`}
                >
                  {statusLabel(status)}
                </div>

              </div>


              {/* cliente */}

              <div className="orderCard__buyer">

                <div className="buyer__name">
                  {o.buyer?.nombre || "Invitado"}
                </div>

                {o.buyer?.telefono && (

                  <div className="buyer__phone">
                    📞 {o.buyer.telefono}
                  </div>

                )}

                {includeEnvio &&
                  o.buyer?.direccion && (

                    <div className="buyer__address">
                      📍 {o.buyer.direccion}
                    </div>

                  )}

              </div>


              {/* stats */}

              <div className="orderCard__stats">

                {totalBurgers > 0 && (

                  <span className="stat stat--burger">
                    🍔 {totalBurgers}
                  </span>

                )}

                {totalMedallones > 0 && (

                  <span className="stat stat--meat">
                    🥩 {totalMedallones}
                  </span>

                )}

                {fries > 0 && (

                  <span className="stat stat--fries">
                    🍟 {fries}
                  </span>

                )}

                {bandejas > 0 && (

                  <span className="stat stat--tray">
                    🍟 bandejas {bandejas}
                  </span>

                )}

                {lomos > 0 && (

                  <span className="stat stat--lomo">
                    🥪 {lomos}
                  </span>

                )}

              </div>


              {/* items */}

              <ul className="orderCard__items">

                {o.items.map((it) => (

                  <li
                    key={`${o.id}-${it.id}-${it.tipo}`}
                  >

                    <span className="item__qty">
                      {it.quantity}x
                    </span>

                    <span className="item__name">
                      {it.name}
                    </span>

                    {it.tipo && (

                      <span className="item__tipo">
                        {it.tipo}
                      </span>

                    )}

                    <span className="item__price">
                      ${fmt(it.subtotal)}
                    </span>

                  </li>

                ))}

              </ul>


              {/* nota */}

              <div>

                <textarea

                  placeholder="nota..."

                  value={
                    noteDraft[o.id] ??
                    o.note ??
                    ""
                  }

                  onChange={(e) =>

                    setNoteDraft((prev) => ({
                      ...prev,
                      [o.id]: e.target.value,
                    }))

                  }

                />

                <button
                  onClick={() =>
                    updateOrderNote(
                      o.id,
                      noteDraft[o.id]
                    )
                  }
                >
                  guardar nota
                </button>

              </div>


              {/* envio */}

              <label>

                <input

                  type="checkbox"

                  checked={includeEnvio}

                  onChange={(e) =>

                    updateOrderShipping(
                      o.id,
                      e.target.checked
                    )

                  }

                />

                envio

              </label>


              {includeEnvio && (

                <div className="addressBox">

                  <input

                    placeholder="direccion"

                    value={
                      addrDraft[o.id]?.direccion ??
                      o.buyer?.direccion ??
                      ""
                    }

                    onChange={(e) =>

                      setAddrDraft((p) => ({
                        ...p,
                        [o.id]: {
                          ...p[o.id],
                          direccion:
                            e.target.value,
                        },
                      }))

                    }

                  />

                  <input

                    placeholder="nombre"

                    value={
                      addrDraft[o.id]?.nombre ??
                      o.buyer?.nombre ??
                      ""
                    }

                    onChange={(e) =>

                      setAddrDraft((p) => ({
                        ...p,
                        [o.id]: {
                          ...p[o.id],
                          nombre:
                            e.target.value,
                        },
                      }))

                    }

                  />

                  <input

                    placeholder="telefono"

                    value={
                      addrDraft[o.id]?.telefono ??
                      o.buyer?.telefono ??
                      ""
                    }

                    onChange={(e) =>

                      setAddrDraft((p) => ({
                        ...p,
                        [o.id]: {
                          ...p[o.id],
                          telefono:
                            e.target.value,
                        },
                      }))

                    }

                  />

                  <button
                    onClick={() =>
                      saveAddress(o)
                    }
                  >
                    guardar
                  </button>

                </div>

              )}


              {/* controles */}

              <div className="orderCard__controls">

                <button
                  className="btn-print"
                  onClick={() =>
                    handleReprint(o)
                  }
                >
                  🖨 reimprimir
                </button>


                <label>

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

                  onChange={(e) =>

                    updateOrderPayment(
                      o.id,
                      true,
                      e.target.value
                    )

                  }

                >

                  <option value="efectivo">
                    efectivo
                  </option>

                  <option value="transferencia">
                    transferencia
                  </option>

                </select>


                <select

                  value={status}

                  onChange={(e) =>

                    updateOrderStatus(
                      o.id,
                      e.target.value
                    )

                  }

                >

                  <option value="PENDING">
                    pendiente
                  </option>

                  <option value="FINISHED">
                    finalizado
                  </option>

                </select>


                <button
                  className="btn-danger"
                  onClick={() =>
                    handleDelete(o.id)
                  }
                >
                  eliminar
                </button>

              </div>


              {/* total */}

              <div className="orderCard__footer">

                total

                <b>
                  ${fmt(o.summary?.total)}
                </b>

              </div>

            </li>

          );

        })}

      </ul>

    </section>
  );
}