// src/components/ProductCard.jsx

import React from "react";
import { toARS } from "../utils/currency";

// Tipos que corresponden a medallones de hamburguesa.
const BURGER_TIPOS      = new Set(["simple", "doble", "triple"]);
const BURGER_CATEGORIES = new Set(["burger"]);

function parseVariants(product) {
  const { price } = product;
  if (!price) return [];

  const keepTipo = BURGER_CATEGORIES.has(product.category);

  const rawVariants = Array.isArray(price)
    ? price.map((obj) => {
        const k = Object.keys(obj)[0];
        const n = Number.parseInt(obj[k], 10);
        return { tipo: k, valor: Number.isNaN(n) ? null : n };
      })
    : Object.entries(price).map(([k, v]) => {
        const n = Number.parseInt(v, 10);
        return { tipo: k, valor: Number.isNaN(n) ? null : n };
      });

  return rawVariants.map((v) => ({
    tipo:  keepTipo && BURGER_TIPOS.has(v.tipo) ? v.tipo : null,
    valor: v.valor,
  }));
}

export default React.memo(function ProductCard({ product, onAdd }) {
  const { id, name, thumbnail, description } = product;
  const variants = parseVariants(product);

  return (
    <div id={id} className="products__card products__card--dark">
      <div className="products__card__tag">Nuevo</div>

      {/* Imagen */}
      <div className="products__card__media">
        <img
          loading="lazy"
          src={thumbnail}
          alt={`Producto ${name}`}
          className="products__card__image"
          style={{ objectPosition: product.imagePosition || "50% 50%" }}
        />
      </div>

      {/* Info */}
      <div className="products__card__info">
        <div className="products__card__info-header">
          <h2 className="products__card__info-header-title">{name}</h2>
        </div>
        <p>{description}</p>
      </div>

      {/* Footer */}
      <div className="products__card__footer">
        {variants.map(({ tipo, valor }) => {
          const hasPrice = typeof valor === "number" && Number.isFinite(valor);
          const shown = hasPrice ? toARS(valor) : "—";

          return (
            <div key={`${id}-${tipo ?? "unit"}`} className="products__card__footer-row">
              <div className="products__card__footer-price">
                {tipo && (
                  <span className="products__card__footer-price-type">{tipo}</span>
                )}
                <span className="products__card__footer-price-value">{shown}</span>
              </div>
              <button
                className="products__card__footer-btn"
                disabled={!hasPrice}
                aria-disabled={!hasPrice}
                onClick={() =>
                  hasPrice &&
                  onAdd({ id, name, thumbnail, description, tipo, precio: valor })
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