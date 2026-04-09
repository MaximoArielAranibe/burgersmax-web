const formatLine = (left, right = '') => {
  const width = 32;
  const leftStr = String(left);
  const rightStr = String(right);

  const spaces = width - leftStr.length - rightStr.length;
  return leftStr + ' '.repeat(spaces > 0 ? spaces : 1) + rightStr;
};

const divider = () => '--------------------------------';

const getTipo = (tipo) => {
  if (!tipo) return '';
  if (typeof tipo === 'string') return tipo;
  if (typeof tipo === 'object') return tipo.label || tipo.name || tipo.value || '';
  return '';
};

export const printOrder = (order) => {
  const now = new Date();

  const hora = now.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const itemsHTML = order.items.map(item => {
    return `<div class="item">${formatLine(
      `${item.quantity}x ${item.name} ${getTipo(item.tipo)}`,
      `$${item.subtotal}`
    )}</div>`;
  }).join('');

  const html = `
    <html>
      <head>
        <title>Ticket</title>
        <style>
          @media print {
            body {
              width: 100%;
              margin: 0;
            }
          }

          body {
            font-family: 'Courier New', monospace;
            width: 58mm;
            font-size: 18px; /* 🔥 antes 11px → ahora grande */
            line-height: 1.4;
            margin: 0;
            padding: 0;
          }

          .center {
            text-align: center;
          }

          .bold {
            font-weight: bold;
          }

          .divider {
            border-top: 2px dashed black;
            margin: 8px 0;
          }

          .title {
            font-size: 26px;
            font-weight: bold;
          }

          .item {
            margin: 4px 0;
          }
        </style>
      </head>

      <body>

        <div class="center title">BURGERSMAX</div>
        <div class="center">${divider()}</div>

        <div class="bold">Pedido #${order.number}</div>
        <div>Hora: ${hora}</div>

        <div class="divider"></div>

        <div>Cliente: ${order.buyer?.nombre || 'Invitado'}</div>
        ${order.buyer?.telefono ? `<div>Tel: ${order.buyer.telefono}</div>` : ''}

        <div class="bold">Entrega: ${order.logistics?.includeEnvio ? 'SI' : 'NO'}</div>

        ${order.logistics?.includeEnvio ? `
          <div>Dir: ${order.buyer?.direccion || ''}</div>
        ` : ''}

        <div class="divider"></div>

        ${itemsHTML}

        <div class="divider"></div>

        <div>${formatLine('SUBTOTAL', `$${order.summary.subtotal}`)}</div>
        <div>${formatLine('ENVIO', `$${order.summary.envio}`)}</div>
        <div class="bold">${formatLine('TOTAL', `$${order.summary.total}`)}</div>

        <div class="divider"></div>

        <div>Pago: ${order.payment?.method || '-'}</div>
        <div class="bold">Pagado: ${order.payment?.paid ? 'SI' : 'NO'}</div>

        ${order.note ? `
          <div class="divider"></div>
          <div class="bold">NOTA:</div>
          <div>${order.note}</div>
        ` : ''}

        <div class="divider"></div>

        <div class="center bold">*** GRACIAS ***</div>

      </body>
    </html>
  `;

  const win = window.open('', '', 'width=600,height=600');

  win.document.write(html);
  win.document.close();

  win.onload = () => {
    win.focus();
    win.print();
    win.close();
  };
};