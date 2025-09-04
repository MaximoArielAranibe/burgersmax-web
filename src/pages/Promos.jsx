// src/pages/Promos.jsx
import React, { useState, useMemo } from "react";
import promos from "../mocks/promos.json";
import { useCart } from "../context/CartContext.jsx";
import "../styles/products.scss"; // opcional si querés estilos ya existentes

const fmtARS = (n) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export const Promos = () => {
  const [dia, setDia] = useState(new Date().getDay()); // 0..6 (dom..sáb)
  const { addToCart } = useCart();

  // Relacionamos el número del día con su clave en el JSON
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
  const promosDelDia = (nombreDia && promos[nombreDia]) || [];

  const handleAdd = (promo, index) => {
    // ID estable por promo (día + índice)
    const id = `promo-${nombreDia}-${index}`;
    addToCart({
      id,
      name: promo.nombre,
      tipo: "promo",                 // clave para agrupar en el carrito
      precio: promo.precio,
      thumbnail: promo.thumbnail || null, // si en el futuro agregás imagen en el JSON
    });
  };

  return (
    <section className="promos" style={{ maxWidth: 900, margin: "0 auto", padding: "16px" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>
          {nombreDia
            ? `Promos de ${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)}`
            : "Promos"}
        </h2>

        {/* (Opcional) selector para probar otros días */}
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

      {promosDelDia.length ? (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
          {promosDelDia.map((promo, i) => (
            <li
              key={`${nombreDia}-${i}`}
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
                <div style={{ color: "#6b7280", fontWeight: 700 }}>{fmtARS(promo.precio)}</div>
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
