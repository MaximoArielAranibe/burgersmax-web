// domain/cart.js

export const skuOf = (p) => `${p.id}:${p.tipo ?? 'base'}`;

// ─── Stats inference ──────────────────────────────────────────────────────────
// Fuente única de verdad. Todo ítem que pasa por cartItemToOrderItem
// sale con stats completos — sin importar de dónde venga.

const MEDALLON_WEIGHT = { simple: 1, doble: 2, triple: 3 };

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

export const inferStats = (item) => {

  // 1. Stats explícitos (promos/combos): usar directamente.
  //    Spread con EMPTY_STATS para garantizar que todas las keys existan.
  if (item.stats) return { ...EMPTY_STATS, ...item.stats };

  const category = item.category ?? null;

  // 2. Inferir por category declarada en el JSON.
  switch (category) {
    case 'burger':
      return { ...EMPTY_STATS, burgers: 1, medallones: MEDALLON_WEIGHT[item.tipo] ?? 0 };
    case 'papas_ind':
      return { ...EMPTY_STATS, papas_ind: 1 };
    case 'papas_bandeja':
      return { ...EMPTY_STATS, papas_bandeja: 1 };
    case 'papas_bandeja_cheddar':
      return { ...EMPTY_STATS, papas_bandeja_cheddar: 1 };
    case 'papas_bandeja_cheddar_panceta':
      return { ...EMPTY_STATS, papas_bandeja_cheddar_panceta: 1 };
    case 'milanesa_pollo':
      return { ...EMPTY_STATS, milanesa_pollo: 1, papas_ind: 1 };
    case 'milanesa_carne':
      return { ...EMPTY_STATS, milanesa_carne: 1, papas_ind: 1 };
    case 'lomo':
      return { ...EMPTY_STATS, lomos: 1, papas_ind: 1 }; // lomo completo incluye papas ind
    case 'helado':
      return { ...EMPTY_STATS, helados: 1 };
    case 'adicional':
      return { ...EMPTY_STATS };
    case 'varios':      // 👈 agregar
      return { ...EMPTY_STATS };
    default:
      break;
  }

  // 3. Fallback por nombre (compatibilidad con ítems viejos sin category).
  const name = (item.name ?? '').toLowerCase();
  if (name.includes('bandeja') && name.includes('papas') && name.includes('cheddar') && name.includes('panceta')) return { ...EMPTY_STATS, papas_bandeja_cheddar_panceta: 1 };
  if (name.includes('bandeja') && name.includes('papas') && name.includes('cheddar')) return { ...EMPTY_STATS, papas_bandeja_cheddar: 1 };
  if (name.includes('bandeja') && name.includes('papas')) return { ...EMPTY_STATS, papas_bandeja: 1 };
  if (name.includes('papas')) return { ...EMPTY_STATS, papas_ind: 1 };
  if (name.includes('lomo')) return { ...EMPTY_STATS, lomos: 1, papas_ind: 1 };
  if (name.includes('helado')) return { ...EMPTY_STATS, helados: 1 };
  if (name.includes('milanesa') && name.includes('pollo')) return { ...EMPTY_STATS, milanesa_pollo: 1, papas_ind: 1 };
  if (name.includes('milanesa')) return { ...EMPTY_STATS, milanesa_carne: 1, papas_ind: 1 };

  // 4. Desconocido → todo cero.
  return { ...EMPTY_STATS };
};

// ─── Cart helpers ─────────────────────────────────────────────────────────────

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
    ...i,
    tipo,
    unitPrice: i.precio,
    subtotal: i.precio * i.quantity,
    stats: inferStats({ ...i, tipo }), // siempre presente, nunca undefined
  };
};
