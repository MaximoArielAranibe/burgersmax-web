import React, { useState } from "react";
import promos from "../mocks/promos.json";

export const Promos = () => {
  const [dia, setDia] = useState(new Date().getDay());

  // Relacionamos el número del día con su clave en el JSON
  const diasMap = {
    0: "domingo",
    4: "jueves",
    5: "viernes",
    6: "sabado"
  };

  const nombreDia = diasMap[dia];
  const promosDelDia = promos[nombreDia];

  return (
    <div>
      {promosDelDia ? (
        <>
          <h2>Promos de {nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)}</h2>
          <ul>
            {promosDelDia.map((promo, i) => (
              <li key={i}>
                <strong>{promo.nombre}</strong>: ${promo.precio.toLocaleString()}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Hoy no hay promos disponibles</p>
      )}
    </div>
  );
};
