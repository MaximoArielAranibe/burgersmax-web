// src/pages/Orders.jsx
import React from 'react';
import { useCart } from '../context/CartContext';
import '../styles/orders.scss';

const fmt = n => n.toLocaleString('es-AR');
const fdate = iso => new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });

export default function Orders() {
  const { orders } = useCart();

  if (!orders?.length) {
    return (
      <section className="orders">
        <h2>Pedidos</h2>
        <p>No hay pedidos todavía.</p>
      </section>
    );
  }

  return (
    <section className="orders">
      <h2>Pedidos</h2>
      <ul className="orders__list">
        {orders.map(o => (
          <li key={o.id} className="orders__item">
            <header className="orders__header">
              <strong>Orden:</strong> #{o.number} &nbsp;|&nbsp;
              <strong>Fecha:</strong> {fdate(o.createdAt)} &nbsp;|&nbsp;
              <strong>Estado:</strong> {o.status} &nbsp;|&nbsp;
              <strong>Envío:</strong> {o.logistics?.includeEnvio ? 'Sí' : 'No'} &nbsp;|&nbsp;
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
              {o.payment && (
                <>
                  <strong>Pagado:</strong> {o.payment.paid ? 'Sí' : 'No'}
                  {o.payment.paid && o.payment.method && (
                    <> — <strong>Método:</strong> {o.payment.method}</>
                  )}
                </>
              )}
            </header>

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
          </li>
        ))}
      </ul>
    </section>
  );
}
