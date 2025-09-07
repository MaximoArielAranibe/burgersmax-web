// src/components/ProductCard.jsx
import React from "react";
import { toARS } from "../utils/currency";

// Función para parsear variantes y ocultar "tipo" en productos de papas
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

  // Si es un producto de papas, no mostrar tipo
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

      <div className="products__card__media">
        <img
          loading="lazy"
          src={thumbnail}
          alt={`Producto ${name}`}
          className="products__card__image"
          style={{ objectPosition: product.imagePosition || "50% 50%" }}
        />
      </div>

      <div className="products__card__info">
        <div className="products__card__info-header">
          <h2 className="products__card__info-header-title">{name}</h2>
        </div>
        <p>{description}</p>
      </div>

      <div className="products__card__footer">
        {variants.map(({ tipo, valor }) => {
          const hasPrice = typeof valor === "number" && Number.isFinite(valor);
          const shown = hasPrice ? toARS(valor) : "—";

          return (
            <div key={`${id}-${tipo}`} className="products__card__footer-row">
              {/* Bloque IZQ: variante + precio */}
              <div className="products__card__footer-price">
                {tipo && <span className="products__card__footer-price-type">{tipo}</span>}
                <span className="products__card__footer-price-value">{shown}</span>
              </div>

              {/* Bloque DER: botón */}
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
