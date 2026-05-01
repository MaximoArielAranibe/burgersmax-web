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

// Solo para el tag visual en ItemList — no para cálculos.
const BURGER_TIPOS = new Set(["simple", "doble", "triple"]);

// calcStats: los stats ya vienen calculados desde cartItemToOrderItem (domain/cart.js).
// Esta función solo suma — no infiere nada.
const EMPTY_STATS = {
  burgers: 0,
  medallones: 0,
  papas_ind: 0,
  papas_bandeja: 0,
  papas_bandeja_cheddar: 0,
  papas_bandeja_cheddar_panceta: 0,
  milanesa_pollo: 0,
  milanesa_carne: 0,
  lomos: 0,
  helados: 0,
};

const calcStats = (items) =>
  items.reduce((acc, it) => {
    const s = it.stats ?? {};
    const qty = it.quantity;

    for (const key in EMPTY_STATS) {
      acc[key] += (s[key] ?? 0) * qty;
    }

    return acc;
  }, { ...EMPTY_STATS });

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBadges({ stats }) {
  const badges = [
    { icon: "🍔", value: stats.burgers, label: "", show: stats.burgers > 0 },
    { icon: "🥩", value: stats.medallones, label: "medallones", show: stats.medallones > 0 },
    { icon: "🍟", value: stats.papas_ind, label: "ind", show: stats.papas_ind > 0 },
    { icon: "🍟", value: stats.papas_bandeja, label: "bandeja", show: stats.papas_bandeja > 0 },
    { icon: "🍟", value: stats.papas_bandeja_cheddar, label: "bandeja cheddar", show: stats.papas_bandeja_cheddar > 0 },
    { icon: "🍟", value: stats.papas_bandeja_cheddar_panceta, label: "bandeja cheddar y panceta", show: stats.papas_bandeja_cheddar_panceta > 0 },
    { icon: "🥪", value: stats.lomos, label: "lomo", show: stats.lomos > 0 },
    { icon: "🐔", value: stats.milanesa_pollo, label: "milanesa pollo", show: stats.milanesa_pollo > 0 },
    { icon: "🍲", value: stats.milanesa_carne, label: "milanesa carne", show: stats.milanesa_carne > 0 },
    { icon: "🍦", value: stats.helados, label: "helado", show: stats.helados > 0 },
  ];
  return (
    <div className="stats">
      {badges.filter((b) => b.show).map(({ icon, value, label }) => (
        <span key={icon + label} className="stats__badge">
          {icon} {value}{label && <small> {label}</small>}
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
            {it.tipo && BURGER_TIPOS.has(it.tipo) && (
              <small className="items__tag">{it.tipo}</small>
            )}
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
      {field("nombre", "Nombre")}
      {field("telefono", "Teléfono")}
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

function OrderControls({ paid, method, status, onPrint, onPaid, onMethod, onStatus, onDelete }) {
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

  const [noteDraft, setNoteDraft] = useState({});
  const [addrDraft, setAddrDraft] = useState({});
  const [envioDraft, setEnvioDraft] = useState({});

  // ── Global stats — un solo reduce sobre todas las órdenes ─────────────────
  const globalStats = useMemo(() => {
    return orders.reduce((acc, o) => {
      const s = calcStats(o.items);
      const envio = o.summary?.envio || 0;
      const total = o.summary?.total || 0;

      acc.ventas += total;
      acc.envios += envio;
      acc.productos += total - envio;
      acc.burgers += s.burgers;
      acc.medallones += s.medallones;
      acc.papas_ind += s.papas_ind;
      acc.papas_bandeja += s.papas_bandeja;
      acc.papas_bandeja_cheddar += s.papas_bandeja_cheddar;
      acc.papas_bandeja_cheddar_panceta += s.papas_bandeja_cheddar_panceta;
      acc.lomos += s.lomos;
      acc.milanesa_pollo += s.milanesa_pollo;
      acc.milanesa_carne += s.milanesa_carne;
      acc.helados += s.helados;
      return acc;
    }, {
      ventas: 0, envios: 0, productos: 0,
      burgers: 0, medallones: 0,
      papas_ind: 0, papas_bandeja: 0,
      papas_bandeja_cheddar: 0, papas_bandeja_cheddar_panceta: 0,
      milanesa_pollo: 0, milanesa_carne: 0,
      lomos: 0, helados: 0,
    });
  }, [orders]);

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
      nombre: d.nombre ?? o.buyer?.nombre ?? "",
      telefono: d.telefono ?? o.buyer?.telefono ?? "",
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

      <header className="ordersTop">
        <h2 className="orders__title">Pedidos</h2>
        <button className="btn btn--danger" onClick={deleteAllOrders}>
          Borrar todo
        </button>
      </header>

      {/* ── Barra de stats globales ── */}
      <div className="globalStatsBar">
        <div className="globalStatsBar__group">
          <dl className="globalStatsBar__item globalStatsBar__item--highlight">
            <dt>Ventas totales</dt>
            <dd>${fmt(globalStats.ventas)}</dd>
          </dl>
          <dl className="globalStatsBar__item">
            <dt>Productos</dt>
            <dd>${fmt(globalStats.productos)}</dd>
          </dl>
          <dl className="globalStatsBar__item">
            <dt>Envíos</dt>
            <dd>${fmt(globalStats.envios)}</dd>
          </dl>
        </div>
        <div className="globalStatsBar__group">
          {globalStats.burgers > 0 && <dl className="globalStatsBar__item"><dt>🍔 Hamburguesas</dt><dd>{globalStats.burgers}</dd></dl>}
          {globalStats.medallones > 0 && <dl className="globalStatsBar__item"><dt>🥩 Medallones</dt><dd>{globalStats.medallones}</dd></dl>}
          {globalStats.papas_ind > 0 && <dl className="globalStatsBar__item"><dt>🍟 Papas ind.</dt><dd>{globalStats.papas_ind}</dd></dl>}
          {globalStats.papas_bandeja > 0 && <dl className="globalStatsBar__item"><dt>🍟 Bandejas</dt><dd>{globalStats.papas_bandeja}</dd></dl>}
          {globalStats.papas_bandeja_cheddar > 0 && <dl className="globalStatsBar__item"><dt>🍟 Bandejas cheddar</dt><dd>{globalStats.papas_bandeja_cheddar}</dd></dl>}
          {globalStats.papas_bandeja_cheddar_panceta > 0 && <dl className="globalStatsBar__item"><dt>🍟 Bandejas cheddar panceta</dt><dd>{globalStats.papas_bandeja_cheddar_panceta}</dd></dl>}
          {globalStats.lomos > 0 && <dl className="globalStatsBar__item"><dt>🥪 Lomos</dt><dd>{globalStats.lomos}</dd></dl>}
          {globalStats.helados > 0 && <dl className="globalStatsBar__item"><dt>🍦 Helados</dt><dd>{globalStats.helados}</dd></dl>}
        </div>
      </div>

      {/* ── Cards grid ── */}
      <div className="ordersGrid">
        {orders.map((o) => {
          const status = normalizeStatus(o.status);
          const paid = !!o.payment?.paid;
          const method = o.payment?.method || "efectivo";
          const includeEnvio = !!o.logistics?.includeEnvio;
          const envioCost = envioDraft[o.id] ?? o.summary?.envio ?? ENVIO_OPTIONS[0];
          const stats = calcStats(o.items);

          return (
            <article key={o.id} className={`orderCard orderCard--${status}`}>

              <div className="cardHeader">
                <div>
                  <span className="cardHeader__number">#{o.number}</span>
                  <span className="cardHeader__time">{fdate(o.createdAt)}</span>
                </div>
                <span className={`statusBadge statusBadge--${status}`}>
                  {STATUS_LABEL[status]}
                </span>
              </div>

              <ClientBox
                buyer={o.buyer}
                address={o.buyer?.direccion}
                showAddress={includeEnvio}
              />

              <StatBadges stats={stats} />

              <ItemList items={o.items} />

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

              {includeEnvio && (
                <AddressFields
                  orderId={o.id}
                  buyer={o.buyer}
                  draft={addrDraft[o.id]}
                  onChange={handleAddrChange}
                  onSave={() => handleSaveAddress(o)}
                />
              )}

              <OrderControls
                paid={paid}
                method={method}
                status={status}
                onPrint={() => handleReprint(o)}
                onPaid={() => toggleOrderPaid(o.id)}
                onMethod={(m) => updateOrderPayment(o.id, true, m)}
                onStatus={(s) => updateOrderStatus(o.id, s)}
                onDelete={() => deleteOrder(o.id)}
              />

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
