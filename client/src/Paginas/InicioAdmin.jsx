import React, { useState, useEffect } from 'react';
import '../Estilos/InicioAdmin.css'; // Importamos el archivo CSS para estilos

function InicioAdmin() {
  const [reservas, setReservas] = useState([]);

  // Obtener las reservas del día
  const obtenerReservasDelDia = async () => {
    try {
      const response = await fetch('http://localhost:5000/reservas-dia', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` // Añadir el token JWT para autenticación
        }
      });
      const data = await response.json();
      setReservas(data); // Guardar las reservas obtenidas
    } catch (error) {
      console.error('Error al obtener las reservas:', error);
    }
  };

  useEffect(() => {
    obtenerReservasDelDia();
  }, []);

  return (
    <div className="inicio">
      <h1>Reservas del Día</h1>
      <div className="inicio-content">
        {reservas.length > 0 ? (
          reservas.map((reserva, index) => (
            <div className="card" key={index}>
              <h2>Cancha: {reserva.cancha}</h2>
              <p>Equipo: {reserva.equipo}</p>
              <p>Email del Usuario: {reserva.email_usuario}</p>
            </div>
          ))
        ) : (
          <p>No hay reservas para hoy.</p>
        )}
      </div>
    </div>
  );
}

export default InicioAdmin;
