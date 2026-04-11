/* // domain/cart.js
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
    ...i,           // 👈 spread primero — preserva stats y cualquier campo extra
    tipo,
    unitPrice: i.precio,
    subtotal: i.precio * i.quantity,
  };
}; */


// domain/cart.js

export const skuOf = (p) => `${p.id}:${p.tipo ?? 'base'}`;

// ─── Stats inference ──────────────────────────────────────────────────────────
// Fuente única de verdad para calcular stats de cualquier ítem,
// sin importar si viene de products.json, promos.json o combosFijos.

const MEDALLON_WEIGHT = { simple: 1, doble: 2, triple: 3 };

export const inferStats = (item) => {
  // 1. Si ya tiene stats explícitos (promos/combos), usarlos directamente.
  if (item.stats) return item.stats;

  // 2. Inferir por category (products.json con category declarado).
  const category = item.category ?? null;

  if (category === 'burger') {
    const medallones = MEDALLON_WEIGHT[item.tipo] ?? 0;
    return { burgers: 1, medallones, papas: 0, lomos: 0, helados: 0 };
  }

  if (category === 'lomo') {
    return { burgers: 0, medallones: 0, papas: 1, lomos: 1, helados: 0 };
  }

  if (category === 'helado') {
    return { burgers: 0, medallones: 0, papas: 0, lomos: 0, helados: 1 };
  }

  // 3. Fallback: inferir por nombre (productos sin category declarado).
  const name = (item.name ?? '').toLowerCase();

  if (name.includes('papas')) {
    return { burgers: 0, medallones: 0, papas: 1, lomos: 0, helados: 0 };
  }

  if (name.includes('lomo')) {
    return { burgers: 0, medallones: 0, papas: 1, lomos: 1, helados: 0 };
  }

  if (name.includes('helado')) {
    return { burgers: 0, medallones: 0, papas: 0, lomos: 0, helados: 1 };
  }

  // 4. Sin categoría conocida (adicionales, bebidas, etc.) → todo cero.
  return { burgers: 0, medallones: 0, papas: 0, lomos: 0, helados: 0 };
};

// ─── Cart helpers ─────────────────────────────────────────────────────────────

export const normalizeItem = (p) => {
  const precio    = Number(p?.precio);
  const quantity  = Number(p?.quantity);
  return {
    ...p,
    sku:      skuOf(p),
    precio:   Number.isFinite(precio)                          ? precio   : 0,
    quantity: Number.isFinite(quantity) && quantity > 0        ? quantity : 1,
  };
};

export const cartItemToOrderItem = (i) => {
  const tipo =
    typeof i.tipo === 'object'
      ? i.tipo?.label || i.tipo?.name || i.tipo?.value || ''
      : i.tipo || '';

  return {
    ...i,
    tipo,
    unitPrice: i.precio,
    subtotal:  i.precio * i.quantity,
    stats:     inferStats({ ...i, tipo }), // ✅ siempre calculado, nunca undefined
  };
};