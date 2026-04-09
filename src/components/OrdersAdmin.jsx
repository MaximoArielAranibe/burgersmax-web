import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { formatPrice } from '../hooks/formatPrice.js';

const STATUS_OPTIONS = ['pendiente', 'confirmado', 'en_produccion', 'listo', 'entregado', 'cancelado'];
const PAYMENT_OPTIONS = ['pendiente', 'pagado'];

const labelMap = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_produccion: 'En produccion',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  pagado: 'Pagado',
};

const getSafeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getOrderItems = (order) => {
  const rawItems = order.items || order.cart || order.products || [];

  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems.map((item, index) => {
    const quantity = getSafeNumber(item.quantity ?? item.qty ?? 1) || 1;
    const price = getSafeNumber(item.price ?? item.unitPrice ?? item.unit_price ?? item.subtotal);

    return {
      id: item.id ?? item.sku ?? `${order.id}-item-${index}`,
      title: item.title ?? item.name ?? item.productName ?? `Producto ${index + 1}`,
      quantity,
      price,
      subtotal: getSafeNumber(item.subtotal) || price * quantity,
    };
  });
};

const normalizeOrder = (order, index) => {
  const items = getOrderItems(order);
  const createdAt = order.createdAt || order.date || order.created_at || order.timestamp || new Date().toISOString();
  const total = getSafeNumber(order.total) || items.reduce((acc, item) => acc + item.subtotal, 0);
  const customer = order.customer || order.client || {};

  return {
    raw: order,
    id: order.id ?? order.orderId ?? order.code ?? `pedido-${index + 1}`,
    createdAt,
    customerName: customer.name || order.customerName || order.name || 'Cliente sin nombre',
    customerPhone: customer.phone || order.customerPhone || order.phone || '-',
    customerEmail: customer.email || order.customerEmail || order.email || '-',
    customerAddress: customer.address || order.customerAddress || order.address || '-',
    items,
    total,
    status: order.status || order.orderStatus || 'pendiente',
    paymentStatus: order.paymentStatus || (order.isPaid ? 'pagado' : 'pendiente'),
    paymentMethod: order.paymentMethod || order.method || '-',
    notes: order.notes || order.comment || '',
  };
};

const buildPrintTemplate = (order, businessName) => {
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td>${item.title}</td>
          <td style="text-align:center;">${item.quantity}</td>
          <td style="text-align:right;">$${formatPrice(item.price)}</td>
          <td style="text-align:right;">$${formatPrice(item.subtotal)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Pedido ${order.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 32px;
            color: #1f2937;
          }
          h1, h2, h3, p {
            margin: 0 0 12px;
          }
          .header, .summary, .notes {
            margin-bottom: 24px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px 24px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
          }
          th, td {
            border-bottom: 1px solid #d1d5db;
            padding: 10px 8px;
            font-size: 14px;
          }
          th {
            text-align: left;
            background: #f3f4f6;
          }
          .total {
            margin-top: 16px;
            text-align: right;
            font-size: 20px;
            font-weight: 700;
          }
          .tag {
            display: inline-block;
            margin-right: 8px;
            padding: 6px 10px;
            border-radius: 999px;
            background: #e5e7eb;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <section class="header">
          <h1>${businessName}</h1>
          <h2>Pedido ${order.id}</h2>
          <p>Fecha: ${new Date(order.createdAt).toLocaleString('es-AR')}</p>
          <span class="tag">${labelMap[order.status] || order.status}</span>
          <span class="tag">${labelMap[order.paymentStatus] || order.paymentStatus}</span>
        </section>

        <section class="summary">
          <h3>Datos del cliente</h3>
          <div class="grid">
            <p><strong>Nombre:</strong> ${order.customerName}</p>
            <p><strong>Telefono:</strong> ${order.customerPhone}</p>
            <p><strong>Email:</strong> ${order.customerEmail}</p>
            <p><strong>Direccion:</strong> ${order.customerAddress}</p>
            <p><strong>Pago:</strong> ${order.paymentMethod}</p>
          </div>
        </section>

        <section>
          <h3>Detalle</h3>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th style="text-align:center;">Cant.</th>
                <th style="text-align:right;">Unitario</th>
                <th style="text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p class="total">Total: $${formatPrice(order.total)}</p>
        </section>

        ${
          order.notes
            ? `
              <section class="notes">
                <h3>Notas</h3>
                <p>${order.notes}</p>
              </section>
            `
            : ''
        }

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `;
};

const OrdersAdmin = ({
}) => {
/*   storageKey = 'orders',
  businessName = 'Maximo Aberturas',
  emptyMessage = 'Todavia no hay pedidos cargados.', */
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [paymentFilter, setPaymentFilter] = useState('todos');

  useEffect(() => {
    const syncOrders = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        const parsed = saved ? JSON.parse(saved) : [];
        const normalized = Array.isArray(parsed)
          ? parsed.map((order, index) => normalizeOrder(order, index))
          : [];

        normalized.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(normalized);
      } catch (error) {
        console.error('No se pudieron leer los pedidos:', error);
        toast.error('No se pudieron cargar los pedidos');
      }
    };

    syncOrders();
    window.addEventListener('storage', syncOrders);

    return () => window.removeEventListener('storage', syncOrders);
  }, [storageKey]);

  const persistOrders = (nextOrders) => {
    setOrders(nextOrders);

    const payload = nextOrders.map(({ raw, ...order }) => ({
      ...raw,
      id: order.id,
      createdAt: order.createdAt,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      customerAddress: order.customerAddress,
      items: order.items,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      notes: order.notes,
    }));

    localStorage.setItem(storageKey, JSON.stringify(payload));
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        [
          order.id,
          order.customerName,
          order.customerPhone,
          order.customerEmail,
          order.customerAddress,
          ...order.items.map((item) => item.title),
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);

      const matchesStatus = statusFilter === 'todos' || order.status === statusFilter;
      const matchesPayment = paymentFilter === 'todos' || order.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, paymentFilter, search, statusFilter]);

  const updateOrder = (orderId, patch, successMessage) => {
    const nextOrders = orders.map((order) =>
      order.id === orderId
        ? {
            ...order,
            ...patch,
            raw: {
              ...order.raw,
              ...patch,
            },
          }
        : order
    );

    persistOrders(nextOrders);
    toast.success(successMessage);
  };

  const handleReprint = (order) => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');

    if (!printWindow) {
      toast.error('Tu navegador bloqueo la ventana de impresion');
      return;
    }

    printWindow.document.write(buildPrintTemplate(order, businessName));
    printWindow.document.close();
  };

  const metrics = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.status === 'pendiente').length,
      paid: orders.filter((order) => order.paymentStatus === 'pagado').length,
      revenue: orders
        .filter((order) => order.paymentStatus === 'pagado')
        .reduce((acc, order) => acc + order.total, 0),
    }),
    [orders]
  );

  return (
    <section style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Panel administrativo</p>
          <h1 style={styles.title}>Pedidos</h1>
          <p style={styles.subtitle}>
            Lista, actualiza estados, reimprime comprobantes y marca pagos desde un solo lugar.
          </p>
        </div>
      </div>

      <div style={styles.metricsGrid}>
        <article style={styles.metricCard}>
          <span style={styles.metricLabel}>Pedidos</span>
          <strong style={styles.metricValue}>{metrics.total}</strong>
        </article>
        <article style={styles.metricCard}>
          <span style={styles.metricLabel}>Pendientes</span>
          <strong style={styles.metricValue}>{metrics.pending}</strong>
        </article>
        <article style={styles.metricCard}>
          <span style={styles.metricLabel}>Pagados</span>
          <strong style={styles.metricValue}>{metrics.paid}</strong>
        </article>
        <article style={styles.metricCard}>
          <span style={styles.metricLabel}>Ingresos cobrados</span>
          <strong style={styles.metricValue}>${formatPrice(metrics.revenue)}</strong>
        </article>
      </div>

      <div style={styles.filters}>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por cliente, pedido o producto"
          style={styles.input}
        />

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={styles.select}>
          <option value="todos">Todos los estados</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {labelMap[status] || status}
            </option>
          ))}
        </select>

        <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} style={styles.select}>
          <option value="todos">Todos los pagos</option>
          {PAYMENT_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {labelMap[status] || status}
            </option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div style={styles.emptyState}>
          <h2 style={styles.emptyTitle}>{emptyMessage}</h2>
          <p style={styles.emptyCopy}>
            El componente busca pedidos en <code>{storageKey}</code>. Si mas adelante migras a Firebase, solo tenes que
            reemplazar la carga y persistencia.
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {filteredOrders.map((order) => (
            <article key={order.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <div style={styles.cardTitleRow}>
                    <h2 style={styles.cardTitle}>Pedido {order.id}</h2>
                    <span style={styles.date}>{new Date(order.createdAt).toLocaleString('es-AR')}</span>
                  </div>
                  <p style={styles.customer}>
                    {order.customerName} | {order.customerPhone}
                  </p>
                  <p style={styles.secondary}>
                    {order.customerEmail} | {order.customerAddress}
                  </p>
                </div>

                <div style={styles.tags}>
                  <span style={{ ...styles.tag, ...getTagStyle(order.status) }}>{labelMap[order.status] || order.status}</span>
                  <span style={{ ...styles.tag, ...getTagStyle(order.paymentStatus) }}>
                    {labelMap[order.paymentStatus] || order.paymentStatus}
                  </span>
                </div>
              </div>

              <div style={styles.itemsBox}>
                {order.items.map((item) => (
                  <div key={item.id} style={styles.itemRow}>
                    <span>
                      {item.title} x{item.quantity}
                    </span>
                    <strong>${formatPrice(item.subtotal)}</strong>
                  </div>
                ))}
              </div>

              <div style={styles.summaryRow}>
                <div>
                  <p style={styles.summaryLabel}>Metodo de pago</p>
                  <strong>{order.paymentMethod}</strong>
                </div>
                <div>
                  <p style={styles.summaryLabel}>Total</p>
                  <strong style={styles.total}>${formatPrice(order.total)}</strong>
                </div>
              </div>

              {order.notes ? <p style={styles.notes}>Notas: {order.notes}</p> : null}

              <div style={styles.actions}>
                <label style={styles.control}>
                  <span style={styles.controlLabel}>Estado</span>
                  <select
                    value={order.status}
                    onChange={(event) =>
                      updateOrder(order.id, { status: event.target.value }, `Estado actualizado a ${labelMap[event.target.value]}`)
                    }
                    style={styles.select}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {labelMap[status] || status}
                      </option>
                    ))}
                  </select>
                </label>

                <button type="button" onClick={() => handleReprint(order)} style={styles.secondaryButton}>
                  Reimprimir
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateOrder(
                      order.id,
                      { paymentStatus: order.paymentStatus === 'pagado' ? 'pendiente' : 'pagado' },
                      order.paymentStatus === 'pagado' ? 'Pago marcado como pendiente' : 'Pago registrado'
                    )
                  }
                  style={order.paymentStatus === 'pagado' ? styles.successGhostButton : styles.successButton}
                >
                  {order.paymentStatus === 'pagado' ? 'Pago registrado' : 'Marcar pago'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

const getTagStyle = (value) => {
  switch (value) {
    case 'pagado':
    case 'entregado':
      return { background: '#dcfce7', color: '#166534' };
    case 'confirmado':
    case 'listo':
      return { background: '#dbeafe', color: '#1d4ed8' };
    case 'cancelado':
      return { background: '#fee2e2', color: '#b91c1c' };
    default:
      return { background: '#fef3c7', color: '#92400e' };
  }
};

const styles = {
  page: {
    width: 'min(1180px, calc(100% - 32px))',
    margin: '120px auto 64px',
    display: 'grid',
    gap: '24px',
    color: '#111827',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '16px',
  },
  eyebrow: {
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontSize: '12px',
    fontWeight: 700,
    color: '#b45309',
  },
  title: {
    margin: '8px 0 6px',
    fontSize: 'clamp(2rem, 4vw, 3rem)',
  },
  subtitle: {
    margin: 0,
    maxWidth: '700px',
    color: '#4b5563',
    lineHeight: 1.6,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  metricCard: {
    padding: '18px 20px',
    borderRadius: '18px',
    background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)',
    border: '1px solid #fed7aa',
    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.06)',
  },
  metricLabel: {
    display: 'block',
    marginBottom: '10px',
    fontSize: '14px',
    color: '#9a3412',
  },
  metricValue: {
    fontSize: '30px',
    lineHeight: 1,
  },
  filters: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.8fr) repeat(2, minmax(180px, 0.7fr))',
    gap: '12px',
  },
  input: {
    width: '100%',
    minHeight: '48px',
    padding: '0 14px',
    borderRadius: '14px',
    border: '1px solid #d1d5db',
    outline: 'none',
    fontSize: '15px',
  },
  select: {
    width: '100%',
    minHeight: '48px',
    padding: '0 14px',
    borderRadius: '14px',
    border: '1px solid #d1d5db',
    outline: 'none',
    background: '#ffffff',
    fontSize: '15px',
  },
  emptyState: {
    padding: '40px 24px',
    borderRadius: '24px',
    background: '#f8fafc',
    border: '1px dashed #cbd5e1',
    textAlign: 'center',
  },
  emptyTitle: {
    margin: '0 0 10px',
  },
  emptyCopy: {
    margin: 0,
    color: '#475569',
    lineHeight: 1.6,
  },
  list: {
    display: 'grid',
    gap: '18px',
  },
  card: {
    padding: '24px',
    borderRadius: '24px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
    display: 'grid',
    gap: '18px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
  },
  cardTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  cardTitle: {
    margin: 0,
    fontSize: '24px',
  },
  date: {
    color: '#6b7280',
    fontSize: '14px',
  },
  customer: {
    margin: '8px 0 4px',
    fontWeight: 700,
  },
  secondary: {
    margin: 0,
    color: '#6b7280',
  },
  tags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  tag: {
    padding: '8px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  itemsBox: {
    padding: '16px',
    borderRadius: '18px',
    background: '#f8fafc',
    border: '1px solid #e5e7eb',
    display: 'grid',
    gap: '10px',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '24px',
    flexWrap: 'wrap',
  },
  summaryLabel: {
    margin: '0 0 6px',
    color: '#6b7280',
    fontSize: '14px',
  },
  total: {
    fontSize: '28px',
  },
  notes: {
    margin: 0,
    padding: '14px 16px',
    borderRadius: '16px',
    background: '#fff7ed',
    color: '#9a3412',
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: 'minmax(220px, 1fr) repeat(2, minmax(160px, auto))',
    gap: '12px',
    alignItems: 'end',
  },
  control: {
    display: 'grid',
    gap: '8px',
  },
  controlLabel: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#374151',
  },
  secondaryButton: {
    minHeight: '48px',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    background: '#ffffff',
    color: '#0f172a',
    fontWeight: 700,
    cursor: 'pointer',
    padding: '0 16px',
  },
  successButton: {
    minHeight: '48px',
    border: '1px solid #16a34a',
    borderRadius: '14px',
    background: '#16a34a',
    color: '#ffffff',
    fontWeight: 700,
    cursor: 'pointer',
    padding: '0 16px',
  },
  successGhostButton: {
    minHeight: '48px',
    border: '1px solid #86efac',
    borderRadius: '14px',
    background: '#f0fdf4',
    color: '#166534',
    fontWeight: 700,
    cursor: 'pointer',
    padding: '0 16px',
  },
};

export default OrdersAdmin;