import React, { useState, useEffect } from 'react';
import '../Estilos/InicioAdmin.css'; // Importamos el archivo CSS para estilos

function InicioAdmin() {
  // Estado para almacenar las reservas del día
  const [reservasDiarias, setReservasDiarias] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener las reservas del día desde el backend
  const obtenerReservasDiarias = async () => {
    try {
      const response = await fetch('http://localhost:5000/reservas-dia', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Enviamos el token JWT
        }
      });
      const data = await response.json();
      setReservasDiarias(data); // Almacenar las reservas obtenidas
      setLoading(false); // Ya no está cargando
    } catch (error) {
      console.error('Error al obtener las reservas:', error);
      setLoading(false); // En caso de error, detener el estado de carga
    }
  };

  // Llamar a la función para obtener reservas al montar el componente
  useEffect(() => {
    obtenerReservasDiarias();
  }, []);

  return (
    <div className="inicio">
      <div className="inicio-content">
        <div className="card">
          <h2>Reservas del Día</h2>
          <p>Administra las reservas de los usuarios programadas para hoy.</p>
          
          {/* Mostrar un mensaje mientras se cargan las reservas */}
          {loading ? (
            <p>Cargando reservas...</p>
          ) : (
            <div className="reservas-list">
              {reservasDiarias.length === 0 ? (
                <p>No hay reservas para hoy.</p> // Mensaje si no hay reservas
              ) : (
                reservasDiarias.map((reserva, index) => (
                  <div className="reserva-card" key={index}>
                    <h3>{reserva.nombre}</h3>
                    <p><strong>RUT:</strong> {reserva.rut}</p>
                    <p><strong>Cancha:</strong> {reserva.cancha}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InicioAdmin;
