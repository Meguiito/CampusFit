import React, { useState, useEffect } from 'react';
import '../Estilos/TuReservacion.css';

const ErrorNotification = ({ children }) => {
  return <div className="error-notification">{children}</div>;
};

function TuReservacion() {
  const [reservas, setReservas] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchReservas = async () => {
      setCargando(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No se encontró el token de autenticación.');
        setCargando(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/reservas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Datos de reservas', data);
          setReservas(data.reservas || []);
        } else if (response.status === 409) {
          setError('Ya existe una reserva para la misma fecha y hora.');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Error al obtener las reservas.');
        }
      } catch (error) {
        console.error('Error de red:', error);
        setError('Error al conectar con el servidor.');
      } finally {
        setCargando(false);
      }
    };

    fetchReservas();
  }, []);

  return (
    <main id="tu-reservacion">
      <div className="contenedor">
        <h2>Tu Reservación</h2>
        {cargando && <p>Cargando reservas...</p>}
        {error && <ErrorNotification>{error}</ErrorNotification>}
  
        {reservas.length > 0 ? (
          <div className="reservacion">
            {reservas.map((reserva, index) => (
              <div className="tarjeta" key={index}>
                <div className="detalle">
                  <strong>Día:</strong> {reserva.fecha}
                  <br />
                  <strong>Hora:</strong> {reserva.hora}
                  <br />
                  <strong>Cancha:</strong> {reserva.cancha}
                  <br />
                  <strong>Equipo:</strong> {reserva.equipo}
                  <br />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay reservas realizadas.</p>
        )}
      </div>
    </main>
  );
}  

export default TuReservacion;
