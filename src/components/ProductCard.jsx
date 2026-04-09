// src/components/ProductCard.jsx

import React from "react";
import { toARS } from "../utils/currency";

// La lógica para parsear las variantes es correcta y se mantiene igual.
function parseVariants(product) {
  const { price, name } = product;
  if (!price) return [];

  const variants = Array.isArray(price)
    ? price.map(obj => {
        const k = Object.keys(obj)[0];
        const n = Number.parseInt(obj[k], 10);
        return { tipo: k, valor: Number.isNaN(n) ? null : n };
      })
    : Object.entries(price).map(([k, v]) => {
        const n = Number.parseInt(v, 10);
        return { tipo: k, valor: Number.isNaN(n) ? null : n };
      });

  if (name.toLowerCase().includes("papas")) {
    return variants.map(v => ({ tipo: null, valor: v.valor }));
  }

  return variants;
}

export default React.memo(function ProductCard({ product, onAdd }) {
  const { id, name, thumbnail, description } = product;
  const variants = parseVariants(product);

  return (
    <div id={id} className="products__card products__card--dark">
      <div className="products__card__tag">Nuevo</div>

      {/* 1. Bloque de Imagen */}
      <div className="products__card__media">
        <img
          loading="lazy"
          src={thumbnail}
          alt={`Producto ${name}`}
          className="products__card__image"
          style={{ objectPosition: product.imagePosition || "50% 50%" }}
        />
      </div>

      {/* 2. Bloque de Información (Este crecerá para empujar el footer) */}
      <div className="products__card__info">
        <div className="products__card__info-header">
          <h2 className="products__card__info-header-title">{name}</h2>
        </div>
        <p>{description}</p>
      </div>

      {/* 3. Bloque Footer (Quedará siempre alineado abajo) */}
      <div className="products__card__footer">
        {variants.map(({ tipo, valor }) => {
          const hasPrice = typeof valor === "number" && Number.isFinite(valor);
          const shown = hasPrice ? toARS(valor) : "—";

          return (
            <div key={`${id}-${tipo}`} className="products__card__footer-row">
              <div className="products__card__footer-price">
                {tipo && <span className="products__card__footer-price-type">{tipo}</span>}
                <span className="products__card__footer-price-value">{shown}</span>
              </div>
              <button
                className="products__card__footer-btn"
                disabled={!hasPrice}
                aria-disabled={!hasPrice}
                onClick={() =>
                  hasPrice &&
                  onAdd({
                    id,
                    name,
                    thumbnail,
                    description,
                    tipo,
                    precio: valor,
                  })
                }
              >
                Comprar 🛒
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
});