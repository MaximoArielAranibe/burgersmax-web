import { useState, useMemo } from "react";
import { useCart } from "../context/CartContext.jsx";
import { printOrder } from "../services/printer.js";
import "../styles/orders.scss";

// ─── Formatters ──────────────────────────────────────────────────────────────

const fmt = (n) =>
  Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 0 });

const fdate = (iso) =>
  new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

// ─── Domain helpers ───────────────────────────────────────────────────────────

const ENVIO_OPTIONS = [2000, 2500, 3000, 3500];

const normalizeStatus = (s) => (s === "FINISHED" ? "FINISHED" : "PENDING");

const STATUS_LABEL = { FINISHED: "Finalizado", PENDING: "Pendiente" };

// Tipos de medallón válidos. "simple" en papas/lomos/adicionales NO cuenta.
const MEDALLON_WEIGHT = { simple: 1, doble: 2, triple: 3 };

const isFries  = (it) => it.name.toLowerCase().includes("papas");
const isLomo   = (it) => it.name.toLowerCase().includes("lomo");

// Un ítem es burger solo si su tipo es un tipo de medallón conocido
// Y no es papas ni lomo (que también pueden llegar con tipo:"simple" del JSON).
const isBurger = (it) =>
  it.tipo != null &&
  it.tipo in MEDALLON_WEIGHT &&
  !isFries(it) &&
  !isLomo(it);

const calcStats = (items) =>
  items.reduce(
    (acc, it) => {
      if (isBurger(it)) {
        acc.burgers   += it.quantity;
        acc.medallones += (MEDALLON_WEIGHT[it.tipo] ?? 0) * it.quantity;
      }
      if (isFries(it)) acc.fries += it.quantity;
      if (isLomo(it))  acc.lomos += it.quantity;
      return acc;
    },
    { burgers: 0, medallones: 0, fries: 0, lomos: 0 }
  );

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBadges({ stats }) {
  const badges = [
    { icon: "🍔", value: stats.burgers,   show: stats.burgers > 0 },
    { icon: "🥩", value: stats.medallones, show: stats.medallones > 0 },
    { icon: "🍟", value: stats.fries,     show: stats.fries > 0 },
    { icon: "🥪", value: stats.lomos,     show: stats.lomos > 0 },
  ];
  return (
    <div className="stats">
      {badges.filter((b) => b.show).map(({ icon, value }) => (
        <span key={icon} className="stats__badge">
          {icon} {value}
        </span>
      ))}
    </div>
  );
}

function ItemList({ items }) {
  return (
    <ul className="items">
      {items.map((it) => (
        <li key={`${it.id}-${it.tipo}`} className="items__row">
          <span className="items__qty">{it.quantity}×</span>
          <span className="items__name">
            {it.name}
            {it.tipo && <small className="items__tag">{it.tipo}</small>}
          </span>
          <span className="items__price">${fmt(it.subtotal)}</span>
        </li>
      ))}
    </ul>
  );
}

function ClientBox({ buyer, address, showAddress }) {
  return (
    <div className="clientBox">
      <div className="clientBox__main">
        <span className="clientBox__name">{buyer?.nombre || "Cliente"}</span>
        {buyer?.telefono && (
          <span className="clientBox__phone">{buyer.telefono}</span>
        )}
      </div>
      {showAddress && address && (
        <p className="clientBox__address">{address}</p>
      )}
    </div>
  );
}

function AddressFields({ orderId, buyer, draft, onChange, onSave }) {
  const field = (key, placeholder) => (
    <input
      className="addressBox__input"
      placeholder={placeholder}
      value={draft?.[key] ?? buyer?.[key] ?? ""}
      onChange={(e) => onChange(orderId, key, e.target.value)}
    />
  );
  return (
    <div className="addressBox">
      {field("direccion", "Dirección")}
      {field("nombre",    "Nombre")}
      {field("telefono",  "Teléfono")}
      <button className="btn btn--secondary" onClick={onSave}>
        Guardar datos
      </button>
    </div>
  );
}

function PriceSummary({ subtotal, includeEnvio, envioCost }) {
  const total = subtotal + (includeEnvio ? envioCost : 0);
  return (
    <div className="priceBox">
      <div className="priceBox__line">
        <span>Subtotal productos</span>
        <span>${fmt(subtotal)}</span>
      </div>
      {includeEnvio && (
        <div className="priceBox__line priceBox__line--envio">
          <span>Envío</span>
          <span>${fmt(envioCost)}</span>
        </div>
      )}
      <div className="priceBox__total">
        <span>Total</span>
        <span>${fmt(total)}</span>
      </div>
    </div>
  );
}

function OrderControls({ order, paid, method, status, onPrint, onPaid, onMethod, onStatus, onDelete }) {
  return (
    <div className="controls">
      <button className="btn btn--print" onClick={onPrint}>
        🖨 Imprimir
      </button>

      <div className="controls__row">
        <label className="check">
          <input type="checkbox" checked={paid} onChange={onPaid} />
          Pagado
        </label>

        <select className="select" value={method} onChange={(e) => onMethod(e.target.value)}>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
        </select>
      </div>

      <div className="controls__row">
        <select className="select" value={status} onChange={(e) => onStatus(e.target.value)}>
          <option value="PENDING">Pendiente</option>
          <option value="FINISHED">Finalizado</option>
        </select>

        <button className="btn btn--danger" onClick={onDelete}>
          Eliminar
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

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
    updateOrderShippingCost,
  } = useCart();

  // Local UI state keyed by order id
  const [noteDraft,  setNoteDraft]  = useState({});
  const [addrDraft,  setAddrDraft]  = useState({});
  const [envioDraft, setEnvioDraft] = useState({});

  // ── Derived global stats ──────────────────────────────────────────────────
  const { totalGlobal, totalBurgersGlobal } = useMemo(() => ({
    totalGlobal:        orders.reduce((acc, o) => acc + (o.summary?.total || 0), 0),
    totalBurgersGlobal: orders.reduce((acc, o) => acc + calcStats(o.items).burgers, 0),
  }), [orders]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleReprint = async (order) => {
    const updated = orders.find((o) => o.id === order.id);
    await printOrder(updated);
  };

  const handleAddrChange = (id, key, value) =>
    setAddrDraft((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));

  const handleSaveAddress = (o) => {
    const d = addrDraft[o.id] ?? {};
    updateOrderAddress(o.id, {
      nombre:    d.nombre    ?? o.buyer?.nombre    ?? "",
      telefono:  d.telefono  ?? o.buyer?.telefono  ?? "",
      direccion: d.direccion ?? o.buyer?.direccion ?? "",
    });
  };

  const handleEnvioChange = (id, value) => {
    const cost = Number(value);
    setEnvioDraft((prev) => ({ ...prev, [id]: cost }));
    updateOrderShippingCost(id, cost);
  };

  // ── Empty state ───────────────────────────────────────────────────────────

  if (!orders.length) {
    return (
      <section className="orders orders--empty">
        <h2 className="orders__title">Pedidos</h2>
        <p className="orders__emptyMsg">No hay pedidos todavía</p>
      </section>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section className="orders">
      {/* ── Header ── */}
      <header className="ordersTop">
        <div>
          <h2 className="orders__title">Pedidos</h2>
          <div className="globalStats">
            <dl className="globalStats__item">
              <dt>Ventas</dt>
              <dd>${fmt(totalGlobal)}</dd>
            </dl>
            <dl className="globalStats__item">
              <dt>Hamburguesas</dt>
              <dd>{totalBurgersGlobal}</dd>
            </dl>
          </div>
        </div>
        <button className="btn btn--danger" onClick={deleteAllOrders}>
          Borrar todo
        </button>
      </header>

      {/* ── Cards grid ── */}
      <div className="ordersGrid">
        {orders.map((o) => {
          const status      = normalizeStatus(o.status);
          const paid        = !!o.payment?.paid;
          const method      = o.payment?.method || "efectivo";
          const includeEnvio = !!o.logistics?.includeEnvio;
          const envioCost   = envioDraft[o.id] ?? o.summary?.envio ?? ENVIO_OPTIONS[0];
          const stats       = calcStats(o.items);

          return (
            <article key={o.id} className={`orderCard orderCard--${status}`}>

              {/* Header */}
              <div className="cardHeader">
                <div>
                  <span className="cardHeader__number">#{o.number}</span>
                  <span className="cardHeader__time">{fdate(o.createdAt)}</span>
                </div>
                <span className={`statusBadge statusBadge--${status}`}>
                  {STATUS_LABEL[status]}
                </span>
              </div>

              {/* Cliente */}
              <ClientBox
                buyer={o.buyer}
                address={o.buyer?.direccion}
                showAddress={includeEnvio}
              />

              {/* Stats */}
              <StatBadges stats={stats} />

              {/* Items */}
              <ItemList items={o.items} />

              {/* Nota */}
              <div className="noteBox">
                <label className="noteBox__label">Notas</label>
                <textarea
                  className="noteBox__textarea"
                  placeholder="Agregar nota..."
                  value={noteDraft[o.id] ?? o.note ?? ""}
                  onChange={(e) =>
                    setNoteDraft((prev) => ({ ...prev, [o.id]: e.target.value }))
                  }
                />
                <button
                  className="btn btn--secondary"
                  onClick={() => updateOrderNote(o.id, noteDraft[o.id])}
                >
                  Guardar nota
                </button>
              </div>

              {/* Envío */}
              <div className="envioSection">
                <label className="check">
                  <input
                    type="checkbox"
                    checked={includeEnvio}
                    onChange={(e) => updateOrderShipping(o.id, e.target.checked)}
                  />
                  Envío
                </label>

                {includeEnvio && (
                  <label className="envioSection__costLabel">
                    Costo de envío
                    <select
                      className="select"
                      value={envioCost}
                      onChange={(e) => handleEnvioChange(o.id, e.target.value)}
                    >
                      {ENVIO_OPTIONS.map((v) => (
                        <option key={v} value={v}>${v}</option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              {/* Dirección (solo si envío activo) */}
              {includeEnvio && (
                <AddressFields
                  orderId={o.id}
                  buyer={o.buyer}
                  draft={addrDraft[o.id]}
                  onChange={handleAddrChange}
                  onSave={() => handleSaveAddress(o)}
                />
              )}

              {/* Controles */}
              <OrderControls
                order={o}
                paid={paid}
                method={method}
                status={status}
                onPrint={() => handleReprint(o)}
                onPaid={() => toggleOrderPaid(o.id)}
                onMethod={(m) => updateOrderPayment(o.id, true, m)}
                onStatus={(s) => updateOrderStatus(o.id, s)}
                onDelete={() => deleteOrder(o.id)}
              />

              {/* Precios */}
              <PriceSummary
                subtotal={o.summary?.subtotal || 0}
                includeEnvio={includeEnvio}
                envioCost={envioCost}
              />

            </article>
          );
        })}
      </div>
    </section>
  );
}
