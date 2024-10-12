import React, { useState } from 'react';
import '../Styles/Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="home">
      <header className="header">
        <div className="portada">
          <h1 className="title">CampusFit</h1>
        </div>
        <nav className="navbar">
          <button className="toggle-button" onClick={toggleMenu}>
            {isOpen ? 'Cerrar' : 'Menu'}
          </button>
          <ul className={isOpen ? 'open' : ''}>
            <li><a href="/Inicio">Inicio</a></li>
            <li><a href="/ReservasEspeciales">Reservas Especiales</a></li>
            <li><a href="/Usuario">Usuario</a></li>
          </ul>
        </nav>
      </header>
    </div>
  );
}

export default Navbar;
