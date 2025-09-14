// src/pages/Orders.jsx
import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import "../styles/orders.scss";

const fmt = (n) => n.toLocaleString("es-AR");
const fdate = (iso) =>
  new Date(iso).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
const statusLabel = (s) => (s === "FINISHED" ? "Finalizado" : "Pendiente");
const normalizeStatus = (s) => (s === "FINISHED" ? "FINISHED" : "PENDING");

// Medallones: solo hamburguesas con campo `tipo`
const calcMedallones = (items) =>
  items.reduce((acc, it) => {
    if (!it.tipo) return acc;
    const tipo = String(it.tipo).toLowerCase();
    const mult = tipo === "doble" ? 2 : tipo === "triple" ? 3 : 1;
    return acc + it.quantity * mult;
  }, 0);

// Conteos generales
const totalBurgersCount = (items) =>
  items.filter((it) => it.tipo).reduce((acc, it) => acc + it.quantity, 0);

// Papas por tipo (buscadores en nombre)
const totalFriesIndividual = (items) =>
  items
    .filter((it) =>
      it.name.toLowerCase().includes("porción de papas") ||
      it.name.toLowerCase().includes("papas individuales")
    )
    .reduce((acc, it) => acc + it.quantity, 0);

const totalFriesTray = (items) =>
  items
    .filter(
      (it) =>
        it.name.toLowerCase().includes("bandeja de papas") &&
        !it.name.toLowerCase().includes("cheddar")
    )
    .reduce((acc, it) => acc + it.quantity, 0);

const totalFriesCheddar = (items) =>
  items
    .filter(
      (it) =>
        it.name.toLowerCase().includes("bandeja de papas con cheddar") &&
        !it.name.toLowerCase().includes("panceta")
    )
    .reduce((acc, it) => acc + it.quantity, 0);

const totalFriesCheddarBacon = (items) =>
  items
    .filter((it) =>
      it.name.toLowerCase().includes("bandeja de papas con cheddar y panceta") ||
      (it.name.toLowerCase().includes("bandeja") &&
        it.name.toLowerCase().includes("cheddar") &&
        it.name.toLowerCase().includes("panceta"))
    )
    .reduce((acc, it) => acc + it.quantity, 0);

// Lomos
const totalLomosCount = (items) =>
  items
    .filter((it) => it.name.toLowerCase().includes("lomo"))
    .reduce((acc, it) => acc + it.quantity, 0);

// Agrupaciones
const summarizeItems = (items) => {
  const summary = {};
  items.forEach((it) => {
    const key = `${it.name}__${it.tipo || ""}`;
    summary[key] = (summary[key] || 0) + it.quantity;
  });
  return summary;
};

const summarizeAllItems = (orders) => {
  const summary = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      const key = `${it.name}__${it.tipo || ""}`;
      summary[key] = (summary[key] || 0) + it.quantity;
    });
  });
  return summary;
};

// Colores por categoría
const itemColor = (name, tipo) => {
  const lower = name.toLowerCase();
  if (lower.includes("papas")) {
    if (lower.includes("cheddar") && lower.includes("panceta")) return "#b91c1c";
    if (lower.includes("cheddar")) return "#f97316";
    return "#facc15";
  }
  if (lower.includes("lomo")) return "#16a34a";
  return "#2563eb";
};

export default function Orders() {
  const {
    orders,
    deleteOrder,
    deleteAllOrders,
    updateOrderNote,
    updateOrderStatus,
    updateOrderPayment,
    toggleOrderPaid,
    updateOrderShipping,
    updateOrderAddress,
  } = useCart();

  const [drafts, setDrafts] = useState({});
  const [pmDraft, setPmDraft] = useState({});
  const [addrDraft, setAddrDraft] = useState({});

  if (!orders?.length)
    return (
      <section className="orders">
        <div className="orders__topbar orders__empty">
          <h2>Pedidos</h2>
        </div>
        <p className="orders__empty">No hay pedidos todavía.</p>
      </section>
    );

  // Totales y resúmenes globales
  const globalBurgersByType = orders.reduce((acc, o) => {
    o.items.forEach((it) => {
      if (!it.tipo) return;
      const tipo = String(it.tipo).toLowerCase();
      acc[tipo] = (acc[tipo] || 0) + it.quantity;
    });
    return acc;
  }, {});

  const globalItemSummary = summarizeAllItems(orders);
  const totalGlobal = orders.reduce((acc, o) => acc + (o.summary?.total || 0), 0);
  const totalGlobalBurgers = orders.reduce((acc, o) => acc + totalBurgersCount(o.items), 0);
  const totalGlobalMedallones = orders.reduce((acc, o) => acc + calcMedallones(o.items), 0);
  const totalGlobalFriesIndividual = orders.reduce((acc, o) => acc + totalFriesIndividual(o.items), 0);
  const totalGlobalFriesTray = orders.reduce((acc, o) => acc + totalFriesTray(o.items), 0);
  const totalGlobalFriesCheddar = orders.reduce((acc, o) => acc + totalFriesCheddar(o.items), 0);
  const totalGlobalFriesCheddarBacon = orders.reduce((acc, o) => acc + totalFriesCheddarBacon(o.items), 0);
  const totalGlobalLomos = orders.reduce((acc, o) => acc + totalLomosCount(o.items), 0);

  // Handlers
  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar este pedido? Esta acción no se puede deshacer."))
      deleteOrder(id);
  };
  const handleDeleteAll = () => {
    if (window.confirm("¿Eliminar TODOS los pedidos? Esta acción no se puede deshacer."))
      deleteAllOrders();
  };
  const handleSaveNote = (id) =>
    updateOrderNote(id, (drafts[id] ?? "").trim());
  const handleStatusChange = (id, value) =>
    updateOrderStatus(id, value === "FINISHED" ? "FINISHED" : "PENDING");
  const handlePaidToggle = (o) => toggleOrderPaid(o.id);
  const handleMethodChange = (o, value) => {
    updateOrderPayment(o.id, true, value);
    setPmDraft((prev) => ({ ...prev, [o.id]: value }));
  };
  const handleShippingToggle = (o, checked) =>
    updateOrderShipping(o.id, checked);
  const onAddrChange = (id, key, value, o) =>
    setAddrDraft((prev) => ({
      ...prev,
      [id]: {
        nombre: (prev[id]?.nombre ?? o.buyer?.nombre) || "",
        telefono: (prev[id]?.telefono ?? o.buyer?.telefono) || "",
        direccion: (prev[id]?.direccion ?? o.buyer?.direccion) || "",
        [key]: value,
      },
    }));
  const saveAddress = (o) => {
    const draft = addrDraft[o.id] || {};
    updateOrderAddress(o.id, {
      nombre: draft.nombre ?? o.buyer?.nombre ?? "",
      telefono: draft.telefono ?? o.buyer?.telefono ?? "",
      direccion: draft.direccion ?? o.buyer?.direccion ?? "",
    });
  };

  return (
    <section className="orders">
      <div className="orders__topbar">
        <h2>Pedidos</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="orders__deleteall" onClick={handleDeleteAll}>
            Eliminar todos
          </button>
        </div>
      </div>

      {/* Totales globales */}
      <div className="orders__global" style={{ marginTop: 16 }}>
        <div style={{ fontSize: "1.05rem", fontWeight: 800 }}>Resumen global</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
          <span>Total ventas: <b>${fmt(totalGlobal)}</b></span>
          <span>Hamburguesas: <b>{totalGlobalBurgers}</b></span>
          <span>Medallones: <b>{totalGlobalMedallones}</b></span>
          <span>Papas individuales: <b>{totalGlobalFriesIndividual}</b></span>
          <span>Bandejas: <b>{totalGlobalFriesTray}</b></span>
          <span>Bandejas cheddar: <b>{totalGlobalFriesCheddar}</b></span>
          <span>Bandejas cheddar + panceta: <b>{totalGlobalFriesCheddarBacon}</b></span>
          <span>Lomos: <b>{totalGlobalLomos}</b></span>
        </div>
      </div>

      {/* Hamburguesas por tipo */}
      <div style={{ marginTop: 12 }}>
        <strong>Hamburguesas por tipo:</strong>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
          {["simple", "doble", "triple"].map((tipo) => (
            <span
              key={tipo}
              style={{
                background: "#2563eb",
                color: "#fff",
                borderRadius: 999,
                padding: "4px 10px",
                fontWeight: 800,
              }}
            >
              {tipo.toUpperCase()}: {globalBurgersByType[tipo] || 0}
            </span>
          ))}
        </div>
      </div>

      {/* Totales globales de ítems */}
      <div style={{ marginTop: 12 }}>
        <strong>Totales por ítem:</strong>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
          {Object.entries(globalItemSummary).map(([key, qty]) => {
            const [name, tipo] = key.split("__");
            return (
              <span
                key={key}
                style={{
                  background: itemColor(name, tipo),
                  color: "#fff",
                  borderRadius: 999,
                  padding: "4px 10px",
                  fontWeight: 800,
                }}
              >
                {qty} {tipo ? `${tipo.toUpperCase()} ` : ""}{name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Lista de pedidos */}
      <ul className="orders__list" style={{ marginTop: 16 }}>
        {orders.map((o) => {
          const status = normalizeStatus(o.status);
          const paid = !!o.payment?.paid;
          const method = o.payment?.method || pmDraft[o.id] || "efectivo";
          const includeEnvio = !!o.logistics?.includeEnvio;

          const totalBurgers = totalBurgersCount(o.items);
          const totalMedallones = calcMedallones(o.items);
          const friesIndividual = totalFriesIndividual(o.items);
          const friesTray = totalFriesTray(o.items);
          const friesCheddar = totalFriesCheddar(o.items);
          const friesCheddarBacon = totalFriesCheddarBacon(o.items);
          const totalLomos = totalLomosCount(o.items);
          const itemSummary = summarizeItems(o.items);

          return (
            <li key={o.id} className="orders__item">
              <header
                className="orders__header"
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <strong>Orden:</strong> #{o.number}
                  <span style={{ color: "#6b7280" }}>{fdate(o.createdAt)}</span>

                  {totalBurgers > 0 && (
                    <span
                      style={{
                        background: "#2563eb",
                        color: "#fff",
                        padding: "4px 8px",
                        borderRadius: 999,
                      }}
                    >
                      Hamburguesas: {totalBurgers}
                    </span>
                  )}
                  {totalMedallones > 0 && (
                    <span
                      style={{
                        background: "#10b981",
                        color: "#fff",
                        padding: "4px 8px",
                        borderRadius: 999,
                      }}
                    >
                      Medallones: {totalMedallones}
                    </span>
                  )}
                  {friesIndividual > 0 && (
                    <span
                      style={{
                        background: "#facc15",
                        color: "#000",
                        padding: "4px 8px",
                        borderRadius: 999,
                      }}
                    >
                      Papas indiv.: {friesIndividual}
                    </span>
                  )}
                  {friesTray > 0 && (
                    <span
                      style={{
                        background: "#fde047",
                        color: "#000",
                        padding: "4px 8px",
                        borderRadius: 999,
                      }}
                    >
                      Bandejas: {friesTray}
                    </span>
                  )}
                  {friesCheddar > 0 && (
                    <span
                      style={{
                        background: "#f97316",
                        color: "#fff",
                        padding: "4px 8px",
                        borderRadius: 999,
                      }}
                    >
                      Cheddar: {friesCheddar}
                    </span>
                  )}
                  {friesCheddarBacon > 0 && (
                    <span
                      style={{
                        background: "#b91c1c",
                        color: "#fff",
                        padding: "4px 8px",
                        borderRadius: 999,
                      }}
                    >
                      Cheddar+Panceta: {friesCheddarBacon}
                    </span>
                  )}
                  {totalLomos > 0 && (
                    <span
                      style={{
                        background: "#16a34a",
                        color: "#fff",
                        padding: "4px 8px",
                        borderRadius: 999,
                      }}
                    >
                      Lomos: {totalLomos}
                    </span>
                  )}
                </div>

                {/* Resumen corto */}
                <div style={{ color: "#555", fontSize: 13 }}>
                  <strong>Estado:</strong> {statusLabel(status)} &nbsp;|&nbsp;
                  <strong>Envío:</strong> {includeEnvio ? "Sí" : "No"}
                  {o.logistics?.readyAt ? (
                    <>
                      &nbsp;|&nbsp; <strong>Listo:</strong>{" "}
                      {new Date(o.logistics.readyAt).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </>
                  ) : null}
                  &nbsp;|&nbsp;
                  <strong>Pagado:</strong> {paid ? `Sí — ${method}` : "No"}{" "}
                  &nbsp;|&nbsp;
                  <strong>Total:</strong> ${fmt(o.summary?.total ?? 0)}
                </div>
              </header>

              {/* Dirección si aplica */}
              {includeEnvio &&
                (o.buyer?.direccion || o.buyer?.nombre || o.buyer?.telefono) && (
                  <p className="orders__note">
                    <b>Entrega:</b>{" "}
                    {o.buyer?.nombre ? `${o.buyer.nombre} — ` : ""}
                    {o.buyer?.direccion || "—"}
                    {o.buyer?.telefono ? ` — ${o.buyer.telefono}` : ""}
                  </p>
                )}

              {/* Controles */}
              <div
                className="orders__controls"
                style={{ display: "grid", gap: 10, marginTop: 8 }}
              >
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={includeEnvio}
                    onChange={(e) => handleShippingToggle(o, e.target.checked)}
                  />{" "}
                  Con envío
                </label>

                {includeEnvio && (
                  <div style={{ display: "grid", gap: 8 }}>
                    <label style={{ display: "grid", gap: 6 }}>
                      Dirección
                      <input
                        value={
                          addrDraft[o.id]?.direccion ?? o.buyer?.direccion ?? ""
                        }
                        onChange={(e) =>
                          onAddrChange(o.id, "direccion", e.target.value, o)
                        }
                        placeholder="Calle 123, depto..."
                      />
                    </label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                      }}
                    >
                      <label style={{ display: "grid", gap: 6 }}>
                        Nombre
                        <input
                          value={addrDraft[o.id]?.nombre ?? o.buyer?.nombre ?? ""}
                          onChange={(e) =>
                            onAddrChange(o.id, "nombre", e.target.value, o)
                          }
                        />
                      </label>
                      <label style={{ display: "grid", gap: 6 }}>
                        Teléfono
                        <input
                          value={
                            addrDraft[o.id]?.telefono ?? o.buyer?.telefono ?? ""
                          }
                          onChange={(e) =>
                            onAddrChange(o.id, "telefono", e.target.value, o)
                          }
                        />
                      </label>
                    </div>
                    <div>
                      <button onClick={() => saveAddress(o)}>
                        Guardar entrega
                      </button>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={paid}
                      onChange={() => handlePaidToggle(o)}
                    />{" "}
                    Pagado
                  </label>

                  <label
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    Método:
                    <select
                      value={method}
                      onChange={(e) => handleMethodChange(o, e.target.value)}
                      disabled={!paid}
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                    </select>
                  </label>
                </div>

                <label
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Estado:
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="FINISHED">Finalizado</option>
                  </select>
                </label>
              </div>

              {/* Nota editable */}
              <div className="orders__noteedit" style={{ marginTop: 10 }}>
                <label style={{ display: "grid", gap: 8 }}>
                  Editar nota / comentarios:
                  <textarea
                    rows={2}
                    value={drafts[o.id] ?? o.note ?? ""}
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [o.id]: e.target.value }))
                    }
                    placeholder="Ej: sin cebolla, extra cheddar..."
                  />
                </label>
                <button onClick={() => handleSaveNote(o.id)}>
                  Guardar nota
                </button>
              </div>

              {/* Items del pedido */}
              <ul className="orders__lines" style={{ marginTop: 12 }}>
                {o.items.map((it) => (
                  <li
                    key={`${o.id}-${it.id}-${it.tipo || "s"}`}
                    className="orders__line"
                  >
                    <span style={{ minWidth: 0 }}>
                      {it.name} <em>({it.tipo || "simple"})</em>
                    </span>
                    <span>
                      {it.quantity} x $
                      {fmt(it.unitPrice ?? it.price ?? it.unitPrice ?? 0)}
                    </span>
                    <span>
                      = $
                      {fmt(
                        it.subtotal ??
                          (it.unitPrice ?? it.price ?? 0) * (it.quantity ?? 1)
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Resumen */}
              <footer className="orders__summary" style={{ marginTop: 12 }}>
                <div>Subtotal: ${fmt(o.summary?.subtotal ?? 0)}</div>
                <div>Envío: ${fmt(o.summary?.envio ?? 0)}</div>
                <div>
                  <b>Total: ${fmt(o.summary?.total ?? 0)}</b>
                </div>
              </footer>

              {/* Acciones */}
              <div className="orders__actions" style={{ marginTop: 12 }}>
                <button
                  className="orders__delete"
                  onClick={() => handleDelete(o.id)}
                >
                  Eliminar pedido
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
