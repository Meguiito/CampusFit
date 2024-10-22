import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Estilos/ReservasEspeciales.css';

function ReservasEspeciales() {
  const [reservas, setReservas] = useState([]);

  // Función para obtener las reservas desde el backend
  const fetchReservas = async () => {
    try {
      const response = await axios.get('http://localhost:5000/special_request');
      setReservas(response.data);
    } catch (error) {
      console.error('Error fetching reservas:', error);
    }
  };

  // Se ejecuta al montar el componente
  useEffect(() => {
    fetchReservas();
  }, []);

  // Función para manejar el cambio de estado
  const handleStatusChange = (index, newStatus) => {
    const updatedReservas = reservas.map((reserva, idx) =>
      idx === index ? { ...reserva, estado: newStatus } : reserva
    );
    setReservas(updatedReservas);
  };

  return (
    <div className="reservas-especiales">
      <h2>Reservas Especiales</h2>
      <div className="reservas-table">
        <ul>
          {reservas.map((reserva, index) => (
            <li key={reserva._id} className="reserva-item">
              <div className="reserva-left">
                <p><strong>Email:</strong> {reserva.user_email}</p>
                <p><strong>Reservas:</strong> {reserva.reservas}</p>
                <p><strong>Mes:</strong> {reserva.meses}</p>
                <p><strong>Cancha:</strong> {reserva.cancha}</p>
                <p><strong>Equipo:</strong> {reserva.equipo}</p>
                <p><strong>Fecha de Subida:</strong> {new Date(reserva.upload_date).toLocaleDateString()}</p>
              </div>

              <div className="pdf-button-container">
                {reserva.filepath && (
                  <a 
                    href={reserva.filepath} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="reservas-button"
                  >
                    Descargar PDF
                  </a>
                )}
              </div>

              <div className="reserva-right">
                <p><strong>Estado:</strong></p>
                <select
                  value={reserva.estado}
                  onChange={(e) => handleStatusChange(index, e.target.value)}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Rechazado">Rechazado</option>
                  <option value="Confirmado">Confirmado</option>
                </select>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ReservasEspeciales;
