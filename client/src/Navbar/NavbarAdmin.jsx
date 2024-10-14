import React, { useState } from 'react';
import '../Estilos/NavbarAdmin.css';

function NavbarAdmin() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="home">
      <header className="header">
        <div className="portada">
          <h1 className="title">CampusFit Admin</h1>
        </div>
        <nav className="navbar">
          <button className="toggle-button" onClick={toggleMenu}>
            {isOpen ? 'Cerrar' : 'Menú'}
          </button>
          <ul className={isOpen ? 'open' : ''}>
            <li><a href="/admin/inicio">Inicio Admin</a></li>
            <li><a href="/admin/usuarios">Usuarios Admin</a></li>
          </ul>
        </nav>
      </header>
    </div>
  );
}

export default NavbarAdmin;
