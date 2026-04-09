// domain/cart.js
export const skuOf = (p) => `${p.id}:${p.tipo ?? 'base'}`;

export const normalizeItem = (p) => {
  const precio = Number(p?.precio);
  const quantity = Number(p?.quantity);
  return {
    ...p,
    sku: skuOf(p),
    precio: Number.isFinite(precio) ? precio : 0,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
  };
};


export const cartItemToOrderItem = (i) => {
  const tipo =
    typeof i.tipo === 'object'
      ? i.tipo?.label || i.tipo?.name || i.tipo?.value || ''
      : i.tipo || '';

  return {
    id: i.id,
    sku: i.sku,
    name: i.name,
    tipo, // ✅ YA ES STRING
    unitPrice: i.precio,
    quantity: i.quantity,
    subtotal: i.precio * i.quantity,
    thumbnail: i.thumbnail ?? null,
  };
};