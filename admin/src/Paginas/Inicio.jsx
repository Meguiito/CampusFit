import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Inicio.css';

function Inicio() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="inicio-title">Panel de Administración</h1>
      </header>
      <main className="main">
        <nav className="sidebar">
          <a href="/Usuarios" className="nav-link">Usuarios</a>
          <a href="/ReservasEspeciales" className="nav-link">Reservas Especiales</a>
          <a href="/Reservas" className="nav-link">Reservas</a>
          <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
        </nav>
        <div className="content">
          <div className="card">
            <h2 className="card-title">Usuarios Activos</h2>
            <p className="card-value">X-X</p>
          </div>
          <div className="card">
            <h2 className="card-title">Reservas Especiales Pendientes</h2>
            <p className="card-value">X-X</p>
          </div>
          <div className="card">
            <h2 className="card-title">Reservas Pendientes</h2>
            <p className="card-value">X-X</p>
          </div>
          <div className="card">
            <h2 className="card-title">Usuarios Retirados</h2>
            <p className="card-value">X-X</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Inicio;
