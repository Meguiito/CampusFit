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
        setReservasDiarias(reservas ? parseInt(reservas, 10) : 0); // Cambié la base a 10
      } else {
        setReservasDiarias(0); // Resetea si es un nuevo día
        localStorage.setItem('fechaReservas', fechaActual); // Actualiza la fecha para el nuevo día
        localStorage.setItem('reservasDiarias', 0); // También restablece el contador en localStorage
      }
    };

    obtenerReservasDiarias();
  }, []);

  const handleVerReservas = () => {
    navigate('/Reservas');
  };

  const handleVerReservasEspeciales = () => {
    navigate('/ReservasEspeciales');
  };

  const handleGestionReservas = () => {
    navigate('/GestionReservas');
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
          <button className="inicio-button" onClick={handleVerReservasEspeciales}>
            Ver Reservas Especiales
          </button>
        </div>
        <div className="card">
          <h2>Gestión de Reservas Canchas</h2>
          <p>Gestiona reservas de canchas y equipos</p>
          <button className="inicio-button" onClick={handleGestionReservas}>
            Gestiona las Reservas
          </button>
        </div>
      </div>
    </div>
  );
}

export default Inicio;
