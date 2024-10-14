// Inicio.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Inicio.css';

function Inicio() {
  const [reservasDiarias, setReservasDiarias] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerReservasDiarias = () => {
      const fechaActual = new Date().toISOString().split('T')[0]; // Obtiene la fecha actual

      const fechaGuardada = localStorage.getItem('fechaReservas');
      const reservas = localStorage.getItem('reservasDiarias');

      if (fechaGuardada === fechaActual) {
        setReservasDiarias(reservas ? parseInt(reservas, 30) : 0);
      } else {
        setReservasDiarias(0); // Resetea si es un nuevo día
      }
    };

    obtenerReservasDiarias();
  }, []);

  const handleVerReservas = () => {
    navigate('/Reservas');
  };

  return (
    <div className="inicio">
      <div className="inicio-content">
        <div className="card">
          <h2>Reservas</h2>
          <p>Administra las reservas de los usuarios.</p>
          <div className="contador-reservas">
            <span>Reservas diarias: {reservasDiarias}</span>
          </div>
          <button className="inicio-button" onClick={handleVerReservas}>
            Ver Reservas
          </button>
        </div>
        <div className="card">
          <h2>Reserva Especial</h2>
          <p>Gestiona las reservas especiales.</p>
          <button className="inicio-button">Ver Reservas Especiales</button>
        </div>
      </div>
    </div>
  );
}

export default Inicio;
