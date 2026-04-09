import escpos from 'escpos';
import Network from 'escpos-network';

escpos.Network = Network;

// ancho real ticket 58mm
const LINE_WIDTH = 32;

const formatLine = (left, right = '') => {
  const leftStr = String(left);
  const rightStr = String(right);

  const spaces = LINE_WIDTH - leftStr.length - rightStr.length;
  return leftStr + ' '.repeat(spaces > 0 ? spaces : 1) + rightStr;
};

const divider = () => '-'.repeat(LINE_WIDTH);

const getTipo = (tipo) => {
  if (!tipo) return '';
  if (typeof tipo === 'string') return tipo;
  if (typeof tipo === 'object') return tipo.label || tipo.name || tipo.value || '';
  return '';
};

export const printTicket = (data) => {
  const device = new escpos.Network('192.168.0.100');
  const printer = new escpos.Printer(device);

  device.open((error) => {
    if (error) {
      console.error('❌ ERROR RED:', error);
      return;
    }

    try {
      printer
        .encode('CP437')
        .align('CT')
        .style('B')
        .size(1, 1)
        .text('BURGERSMAX')
        .style('NORMAL')
        .size(0, 0)
        .text(divider());

      printer
        .align('LT')
        .text(`Pedido: ${data.id}`)
        .text(`Cliente: ${data.cliente || 'Invitado'}`)
        .text(divider());

      // 🧾 ITEMS
      data.items.forEach(item => {
        const tipo = getTipo(item.tipo);

        const name = `${item.nombre} ${tipo && tipo !== 'simple' ? tipo.toUpperCase() : ''}`;
        const qty = `x${item.cantidad}`;

        printer.text(formatLine(name, qty));
      });

      printer.text(divider());

      // 💰 TOTAL
      printer
        .style('B')
        .text(formatLine('TOTAL', `$${data.total}`))
        .style('NORMAL');

      printer
        .text(divider())
        .align('CT')
        .text('*** GRACIAS ***')
        .cut()
        .close();

    } catch (err) {
      console.error('❌ ERROR PRINT:', err);
    }
  });
};