// src/components/Navbar.jsx
import React, { useState } from 'react';
import '../styles/navbar.scss';
import logo from '../assets/icons8-shopping-cart-24.png';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAdmin } from '../context/AdminContext.jsx';

const fmtARS = (n) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart, subtotal } = useCart();
  const { isAdmin, logout } = useAdmin();

  const itemCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <nav className="navbar">
      <div className="navbar__wrapper">
        <div className="navbar__logo">
          <Link to='/' className="navbar__logo--text">BURGERS MAX</Link>
        </div>

        <div className={`navbar__list ${menuOpen ? 'active' : ''}`}>
          <ul className="navbar__list--lista">
            <li><Link to="/">Menu</Link></li>
            {isAdmin && <li><Link to="/pedidos">Pedidos</Link></li>}
            <li><Link to="/promos">Promos</Link></li>
            <li><Link to="/sobre-nosotros">Sobre nosotros</Link></li>
          </ul>
        </div>

        <div className="navbar__icons">
          <button className="navbar__toggle" onClick={() => setMenuOpen((prev) => !prev)}>
            ☰
          </button>

          {/*-Admin: login/logout */}
          {isAdmin ? (
            <button className="navbar__admin" onClick={logout} title="Salir del modo admin">
              Salir
            </button>
          ) : (
            <Link className="navbar__admin" to="/admin" title="Entrar al panel admin">
              Admin
            </Link>
          )}
          <Link to='/cart' className="icon" aria-label="Ir al carrito">
            <img src={logo} alt="Carrito" />
            {itemCount > 0 && (
              <span className="icon__badge" aria-label={`${itemCount} productos en el carrito`}>
                {itemCount}
              </span>
            )}
            <span className="icon__total">{fmtARS(subtotal)}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
