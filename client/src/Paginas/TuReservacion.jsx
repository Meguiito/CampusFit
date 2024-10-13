
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ErrorNotification = ({ children }) => {
  return (
    <div style={{ color: 'red', backgroundColor: 'lightyellow', padding: '10px', borderRadius: '5px' }}>
      {children}
    </div>
  );
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
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Datos de reservas", data);
          setReservas(data.reservas || []); // Usar el valor predeterminado de un arreglo vacío
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
    <Main>
      <Contenedor>
        <h2>Tu Reservación</h2>
        {cargando && <p>Cargando reservas...</p>}
        {error && <ErrorNotification>{error}</ErrorNotification>}

        {reservas.length > 0 ? (
          <Reservacion>
            {reservas.map((reserva, index) => (
              <Detalle key={index}>
                <strong>Día:</strong> {new Date(reserva.fecha).toLocaleDateString()}<br />
                <strong>Hora:</strong> {reserva.hora}<br />
                <strong>Cancha:</strong> {reserva.cancha}<br />
                <strong>Equipo:</strong> {reserva.equipo}<br />
              </Detalle>
            ))}
          </Reservacion>
        ) : (
          <p>No hay reservas realizadas.</p>
        )}
      </Contenedor>
    </Main>
  );
}

export default TuReservacion;


const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background: linear-gradient(135deg, #3498DB, #ffffff);
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  margin: 20px auto;
  transition: transform 0.3s ease;

  h2 {
    color: #ffffff;
    margin-bottom: 20px;
    font-size: 2rem;
  }
`;

const Contenedor = styled.div`
    max-width: 90%;
    align-items: center;
`;


const Reservacion = styled.div`
  background-color: #2985ec;
  border-radius: 15px;
  padding: 20px;
  color: white;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
`;

const Detalle = styled.div`
  margin: 10px 0;
  font-size: 1.2rem;

  strong {
    color: #FFD700;
    margin-right: 10px;
  }
`;
