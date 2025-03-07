import React, { useState } from 'react';
import '../styles/navbar.scss';
import logo from '../assets/icons8-shopping-cart-24.png';
import maxburgerslogo from '../assets/burgers-max-logo-blanco.svg'
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar__wrapper">
        <div className="navbar__logo">
{/*           <img className='navbar__logo--img' src={maxburgerslogo} alt='maxburgerslogo' /> */}
          <span className="navbar__logo--text">BURGERS MAX</span>
        </div>

        <div className={`navbar__list ${menuOpen ? "active" : ""}`}>
          <ul className="navbar__list--lista">
            <li><a href="#">Menu</a></li>
            <li><a href="#">Delivery</a></li>
            <li><a href="#">Sobre nosotros</a></li>
          </ul>
        </div>

        <div className="navbar__icons">
          <button className="navbar__toggle" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>

          <button className="icon">
            <img src={logo} alt='icon' />
            <span style={{ color: "white", marginLeft: "4px", cursor: 'default' }}>0 ARS</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
