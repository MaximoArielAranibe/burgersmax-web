import React, { useState } from 'react';
import '../styles/navbar.scss';
import logo from '../assets/icons8-shopping-cart-24.png';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';


const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { total } = useCart();


  return (
    <nav className="navbar">
      <div className="navbar__wrapper">
        <div className="navbar__logo">
          <Link to='/' className="navbar__logo--text">BURGERS MAX</Link>
        </div>

        <div className={`navbar__list ${menuOpen ? 'active' : ''}`}>
          <ul className="navbar__list--lista">
              <li><Link to="/">Menu</Link></li>
              <li><Link to="/promos">Promos</Link></li>
              <li><Link to="/sobre-nosotros">Sobre nosotros</Link></li>
          </ul>
        </div>

        <div className="navbar__icons">
          <button className="navbar__toggle" onClick={() => setMenuOpen((prev) => !prev)}>
            ☰
          </button>

          <Link to='/cart' className="icon">
            <img src={logo} alt="icon" />
            <span style={{ color: "white", marginLeft: "4px", cursor: 'default' }}>{total}ARS</span>
            </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
