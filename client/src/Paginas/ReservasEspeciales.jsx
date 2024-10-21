import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Estilos/ReservasEspeciales.css';

function ReservasEspeciales() {
  const [reservas, setReservas] = useState([]);

  // Función para obtener las reservas desde el backend
  const fetchReservas = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reservas');
      setReservas(response.data);
    } catch (error) {
      console.error('Error fetching reservas:', error);
    }
  };

  // Se ejecuta al montar el componente
  useEffect(() => {
    fetchReservas();
  }, []);

  return (
    <div>
      <h2>Reservas Especiales</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Reservas</th>
            <th>Meses</th>
            <th>Estado</th>
            <th>Cancha</th>
            <th>Equipo</th>
            <th>Fecha de Subida</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva) => (
            <tr key={reserva._id}>
              <td>{reserva.user_email}</td>
              <td>{reserva.reservas}</td>
              <td>{reserva.meses}</td>
              <td>{reserva.estado}</td>
              <td>{reserva.cancha}</td>
              <td>{reserva.equipo}</td>
              <td>{new Date(reserva.upload_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReservasEspeciales;
