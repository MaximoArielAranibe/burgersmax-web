// src/pages/Promos.jsx
import React, { useState, useMemo } from "react";
import promosPorDia from "../mocks/promos.json";
import { useCart } from "../context/CartContext.jsx";
import "../styles/products.scss";

// Utilidad para formatear precios en ARS
const fmtARS = (n) =>
  n.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

// Combos fijos que siempre están disponibles
const combosFijos = [
  { nombre: "2 Dobles Cheddar + Bandeja de Papas con Cheddar", precio: 19500 },
  {
    nombre: "2 Dobles Cheddar + Bandeja de Papas con Cheddar y Panceta",
    precio: 20500,
  },
  {
    nombre: "2 Panceta & BBQ Triples + Bandeja de Papas con Cheddar y Panceta",
    precio: 25500,
  },
  {
    nombre: "2 Dobles Cheddar Picante + Bandeja de Papas con Cheddar y Panceta",
    precio: 19000,
  },
  { nombre: "2 Completas Triples + Bandeja de Papas con Cheddar", precio: 24500 },
  { nombre: "2 Completas Dobles + Bandeja de Papas con Cheddar", precio: 21500 },
];

export const Promos = () => {
  const [dia, setDia] = useState(new Date().getDay());
  const { addToCart } = useCart();

  // Mapeo explícito de días
  const diasMap = useMemo(
    () => ({
      0: "domingo",
      4: "jueves",
      5: "viernes",
      6: "sabado",
    }),
    []
  );

  const nombreDia = diasMap[dia];
  const promosDelDia = (nombreDia && promosPorDia[nombreDia]) || [];

  // Mezclamos los combos del día + los combos fijos
  const todosPromos = [...promosDelDia, ...combosFijos];

  const handleAdd = (promo, index) => {
    const id =
      promo.id ||
      `promo-${index}-${promo.nombre.replace(/\s+/g, "-").toLowerCase()}`;

    addToCart({
      id,
      name: promo.nombre,
      tipo: "promo",
      precio: promo.precio,
      thumbnail: promo.thumbnail || null,
    });
  };

  return (
    <section
      className="promos"
      style={{ maxWidth: 900, margin: "0 auto", padding: "16px" }}
    >
      <header
        style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}
      >
        <h2 style={{ margin: 0 }}>
          {nombreDia
            ? `Promos de ${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)}`
            : "Promos"}
        </h2>

        <select
          value={dia}
          onChange={(e) => setDia(Number(e.target.value))}
          style={{ marginLeft: "auto" }}
          aria-label="Elegir día"
        >
          <option value={0}>Domingo</option>
          <option value={4}>Jueves</option>
          <option value={5}>Viernes</option>
          <option value={6}>Sábado</option>
        </select>
      </header>

      {todosPromos.length ? (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "grid",
            gap: 12,
          }}
        >
          {todosPromos.map((promo, i) => (
            <li
              key={promo.id || `promo-${i}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 12,
                alignItems: "center",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "12px 14px",
                boxShadow: "0 8px 20px rgba(17,24,39,0.06)",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800 }}>{promo.nombre}</div>
                <div style={{ color: "#6b7280", fontWeight: 700 }}>
                  {fmtARS(promo.precio)}
                </div>
              </div>
              <button
                onClick={() => handleAdd(promo, i)}
                style={{
                  appearance: "none",
                  border: "1px solid #e5e7eb",
                  background: "#111",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Agregar al carrito
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Hoy no hay promos disponibles</p>
      )}
    </section>
  );
};

export default Promos;
