import { useState, useMemo } from "react";
import promosPorDia from "../mocks/promos.json";
import { useCart } from "../context/CartContext.jsx";
import "../styles/promos.scss";
import promo1 from '../assets/PROMO-1.png';
import promo2 from '../assets/PROMO-2.png';
import promo3 from '../assets/PROMO-3.png';
import promo4 from '../assets/PROMO-4.png';
import promo5 from '../assets/PROMO-5.png';
import promo6 from '../assets/PROMO-6.png';

const fmtARS = (n) =>
  n.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

// stats: cuántas unidades de cada cosa aporta este combo al resumen de la orden.
// medallones: cantidad de medallones (simple=1, doble=2, triple=3)
// papas:      porciones de papas (bandeja o individual cuenta como 1)
// lomos:      cantidad de lomos

const combosFijos = [
  {
    nombre: "DOBLE CHEDDAR + papas",
    precio: 13000,
    thumbnail: promo1,
    stats: { burgers: 1, medallones: 2, papas: 1, lomos: 0 },
  },
  {
    nombre: "DOBLE a eleccion + papas + cuarto de helado",
    precio: 16000,
    thumbnail: promo1,
    stats: { burgers: 1, medallones: 2, papas: 1, lomos: 0, helados: 1 },
  },
  {
    nombre: "Simple Cheddar + papas + cuarto de helado",
    precio: 13500,
    thumbnail: "https://i.ibb.co/PzmBr5d3/Promo-simple-cheddar-con-helado.png",
    stats: { burgers: 1, medallones: 1, papas: 1, lomos: 0, helados: 1 },
  },
  {
    nombre: "Simple Completa + papas + cuarto de helado",
    precio: 14000,
    thumbnail: "https://i.ibb.co/4RBM5Y1v/Promo-simple-completa-con-helado.png",
    stats: { burgers: 1, medallones: 1, papas: 1, lomos: 0, helados: 1 },
  },
  {
    nombre: "2 Dobles Cheddar + Bandeja de Papas con Cheddar",
    precio: 26000,
    thumbnail: promo1,
    stats: { burgers: 2, medallones: 4, papas: 1, lomos: 0 },
  },
  {
    nombre: "2 Dobles Cheddar + Bandeja de Papas con Cheddar y Panceta",
    precio: 27500,
    thumbnail: promo2,
    stats: { burgers: 2, medallones: 4, papas: 1, lomos: 0 },
  },
  {
    nombre: "2 Panceta & BBQ Triples + Bandeja de Papas con Cheddar y Panceta",
    precio: 32500,
    thumbnail: promo3,
    stats: { burgers: 2, medallones: 6, papas: 1, lomos: 0 },
  },
  {
    nombre: "2 Dobles Cheddar Picante + Bandeja de Papas con Cheddar y Panceta",
    precio: 27500,
    thumbnail: promo4,
    stats: { burgers: 2, medallones: 4, papas: 1, lomos: 0 },
  },
  {
    nombre: "2 Completas Triples + Bandeja de Papas con Cheddar",
    precio: 33000,
    thumbnail: promo5,
    stats: { burgers: 2, medallones: 6, papas: 1, lomos: 0 },
  },
  {
    nombre: "2 Completas Dobles + Bandeja de Papas con Cheddar",
    precio: 28000,
    thumbnail: promo6,
    stats: { burgers: 2, medallones: 4, papas: 1, lomos: 0 },
  },
];

const diasMap = {
  0: "domingo",
  4: "jueves",
  5: "viernes",
  6: "sabado",
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const Promos = () => {
  const [dia, setDia] = useState(new Date().getDay());
  const { addToCart } = useCart();

  const nombreDia = diasMap[dia];

  const promosDelDia = useMemo(() => {
    if (!nombreDia) return [];
    return promosPorDia[nombreDia] || [];
  }, [nombreDia]);

  const promos = useMemo(
    () => [...promosDelDia, ...combosFijos],
    [promosDelDia]
  );

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
      stats: promo.stats || null, // 👈 se propaga al ítem del carrito
    });
  };

  return (
    <section className="promos">
      <header className="promos__header">
        <h2>
          {nombreDia ? `Promos de ${capitalize(nombreDia)}` : "Promos"}
        </h2>
        <select
          value={dia}
          onChange={(e) => setDia(Number(e.target.value))}
          aria-label="Elegir día"
        >
          <option value={0}>Domingo</option>
          <option value={4}>Jueves</option>
          <option value={5}>Viernes</option>
          <option value={6}>Sábado</option>
        </select>
      </header>

      <div className="promos__container">
        {promos.length ? (
          promos.map((promo, i) => (
            <article key={promo.id || i} className="promos__card">
              {promo.thumbnail && (
                <img
                  src={promo.thumbnail}
                  alt={promo.nombre}
                  className="promos__image"
                  loading="lazy"
                />
              )}
              <div className="promos__name">{promo.nombre}</div>
              <div className="promos__footer">
                <div className="promos__price">
                  <span className="promos__price-label">precio</span>
                  <span className="promos__price-value">{fmtARS(promo.precio)}</span>
                </div>
                <button className="promos__btn" onClick={() => handleAdd(promo, i)}>
                  Agregar
                </button>
              </div>
            </article>
          ))
        ) : (
          <p style={{ color: "white" }}>Hoy no hay promos disponibles</p>
        )}
      </div>
    </section>
  );
};

export default Promos;
