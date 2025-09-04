// src/pages/Orders.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/orders.scss';

const fmt = n => n.toLocaleString('es-AR');
const fdate = iso => new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });

const statusLabel = (s) => (s === 'FINISHED' ? 'Finalizado' : 'Pendiente');
const normalizeStatus = (s) => {
  if (s === 'FINISHED') return 'FINISHED';
  if (s === 'PENDING' || s === 'CREATED' || !s) return 'PENDING';
  return 'PENDING';
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
    // 👇 nuevas funciones
    updateOrderShipping,
    updateOrderAddress,
  } = useCart();

  const [drafts, setDrafts] = useState({});   // { [orderId]: string }
  const [pmDraft, setPmDraft] = useState({}); // { [orderId]: 'efectivo' | 'transferencia' }
  const [addrDraft, setAddrDraft] = useState({}); // { [orderId]: {nombre, telefono, direccion} }

  if (!orders?.length) {
    return (
      <section className="orders">
        <div className="orders__topbar orders__empty">
          <h2>Pedidos</h2>
        </div>
        <p className="orders__empty">No hay pedidos todavía.</p>
      </section>
    );
  }

  const handleDelete = (id) => {
    const ok = window.confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.');
    if (ok) deleteOrder(id);
  };

  const handleDeleteAll = () => {
    const ok = window.confirm('¿Eliminar TODOS los pedidos? Esta acción no se puede deshacer.');
    if (ok) deleteAllOrders();
  };

  const handleSaveNote = (id) => {
    const note = drafts[id] ?? '';
    updateOrderNote(id, note.trim());
  };

  const handleStatusChange = (id, value) => {
    updateOrderStatus(id, value === 'FINISHED' ? 'FINISHED' : 'PENDING');
  };

  const handlePaidToggle = (o) => {
    toggleOrderPaid(o.id);
  };

  const handleMethodChange = (o, value) => {
    updateOrderPayment(o.id, true, value);
    setPmDraft(prev => ({ ...prev, [o.id]: value }));
  };

  const handleShippingToggle = (o, checked) => {
    updateOrderShipping(o.id, checked);
  };

  const onAddrChange = (id, key, value, o) => {
    setAddrDraft(prev => ({
      ...prev,
      [id]: {
        nombre: prev[id]?.nombre ?? (o.buyer?.nombre || ''),
        telefono: prev[id]?.telefono ?? (o.buyer?.telefono || ''),
        direccion: prev[id]?.direccion ?? (o.buyer?.direccion || ''),
        [key]: value
      }
    }));
  };

  const saveAddress = (o) => {
    const draft = addrDraft[o.id] || {};
    updateOrderAddress(o.id, {
      nombre: draft.nombre ?? o.buyer?.nombre ?? '',
      telefono: draft.telefono ?? o.buyer?.telefono ?? '',
      direccion: draft.direccion ?? o.buyer?.direccion ?? '',
    });
  };

  return (
    <section className="orders">
      <div className="orders__topbar">
        <h2>Pedidos</h2>
        <button className="orders__deleteall" onClick={handleDeleteAll}>
          Eliminar todos
        </button>
      </div>

      <ul className="orders__list">
        {orders.map(o => {
          const status = normalizeStatus(o.status);
          const paid = !!o.payment?.paid;
          const method = o.payment?.method || pmDraft[o.id] || 'efectivo';
          const includeEnvio = !!o.logistics?.includeEnvio;

          return (
            <li key={o.id} className="orders__item">
              <header className="orders__header">
                <strong>Orden:</strong> #{o.number} &nbsp;|&nbsp;
                <strong>Fecha:</strong> {fdate(o.createdAt)} &nbsp;|&nbsp;
                <strong>Estado:</strong> {statusLabel(status)} &nbsp;|&nbsp;
                <strong>Envío:</strong> {includeEnvio ? 'Sí' : 'No'} &nbsp;|&nbsp;
                {o.logistics?.readyAt && (
                  <>
                    <strong>Listo:</strong>{" "}
                    {new Date(o.logistics.readyAt).toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    &nbsp;|&nbsp;
                  </>
                )}
                <strong>Pagado:</strong>{" "}
                {paid ? <>Sí — <strong>Método:</strong> {method}</> : 'No'} &nbsp;|&nbsp;
                <strong>Total:</strong> {fmt(o.summary.total)}
              </header>

              {/* Datos de entrega visibles si hay dirección */}
              {includeEnvio && (o.buyer?.direccion || o.buyer?.nombre || o.buyer?.telefono) && (
                <p className="orders__note">
                  <b>Entrega:</b>{" "}
                  {o.buyer?.nombre ? `${o.buyer.nombre} — ` : ''}
                  {o.buyer?.direccion || '—'}
                  {o.buyer?.telefono ? ` — ${o.buyer.telefono}` : ''}
                </p>
              )}

              {/* CONTROLES INLINE */}
              <div className="orders__controls" style={{ display: 'grid', gap: '10px' }}>
                {/* Envío */}
                <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={includeEnvio}
                    onChange={(e) => handleShippingToggle(o, e.target.checked)}
                  />
                  Con envío
                </label>

                {includeEnvio && (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <label style={{ display: 'grid', gap: '6px' }}>
                      Dirección
                      <input
                        type="text"
                        value={(addrDraft[o.id]?.direccion ?? o.buyer?.direccion) || ''}
                        onChange={(e) => onAddrChange(o.id, 'direccion', e.target.value, o)}
                        placeholder="Calle 123, depto 4B…"
                      />
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <label style={{ display: 'grid', gap: '6px' }}>
                        Nombre
                        <input
                          type="text"
                          value={(addrDraft[o.id]?.nombre ?? o.buyer?.nombre) || ''}
                          onChange={(e) => onAddrChange(o.id, 'nombre', e.target.value, o)}
                          placeholder="Nombre y apellido"
                        />
                      </label>

                      <label style={{ display: 'grid', gap: '6px' }}>
                        Teléfono
                        <input
                          type="tel"
                          value={(addrDraft[o.id]?.telefono ?? o.buyer?.telefono) || ''}
                          onChange={(e) => onAddrChange(o.id, 'telefono', e.target.value, o)}
                          placeholder="Ej: 11 5555 5555"
                        />
                      </label>
                    </div>

                    <div>
                      <button onClick={() => saveAddress(o)}>Guardar entrega</button>
                    </div>
                  </div>
                )}

                {/* Pago */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={paid}
                      onChange={() => handlePaidToggle(o)}
                    />
                    Pagado
                  </label>

                  <label style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', gap: '8px' }}>
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

                {/* Estado */}
                <label style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', gap: '8px' }}>
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

              {o.note && <p className="orders__note"><b>Nota:</b> {o.note}</p>}

              <div className="orders__noteedit">
                <label>
                  Editar nota / comentarios:
                  <textarea
                    rows={2}
                    value={drafts[o.id] ?? o.note ?? ''}
                    onChange={(e) => setDrafts(prev => ({ ...prev, [o.id]: e.target.value }))}
                    placeholder="Ej: sin cebolla, extra cheddar, tocar timbre 2B..."
                  />
                </label>
                <button onClick={() => handleSaveNote(o.id)}>Guardar nota</button>
              </div>

              <ul className="orders__lines">
                {o.items.map(it => (
                  <li key={`${o.id}-${it.id}-${it.tipo}`} className="orders__line">
                    <span>{it.name} <em>({it.tipo})</em></span>
                    <span>{it.quantity} x ${fmt(it.unitPrice)}</span>
                    <span>= ${fmt(it.subtotal)}</span>
                  </li>
                ))}
              </ul>

              <footer className="orders__summary">
                <div>Subtotal: ${fmt(o.summary.subtotal)}</div>
                <div>Envío: ${fmt(o.summary.envio)}</div>
                <div><b>Total: ${fmt(o.summary.total)}</b></div>
              </footer>

              <div className="orders__actions">
                <button className="orders__delete" onClick={() => handleDelete(o.id)}>
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
