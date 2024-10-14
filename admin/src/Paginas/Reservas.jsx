import React, { useEffect, useState } from 'react';
import '../Styles/Reservas.css';

function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);

  const fetchReservas = async () => {
    try {
      const token = localStorage.getItem('jwt'); // Asegúrate de que el token está guardado en 'jwt'
      const response = await fetch('http://localhost:5000/api/reservas', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener las reservas');

      const data = await response.json();
      setReservas(data); // Asigna los datos de reservas al estado
    } catch (error) {
      console.error('Error al obtener las reservas:', error);
      setError('Error al obtener la lista de reservas');
    }
  };

  // Función para verificar si el usuario es admin
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch('http://localhost:5000/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('No autorizado');

      const profileData = await response.json();
      if (profileData.tipo_de_usuario === 'admin') {
        setIsAdmin(true);
      } else {
        setError('Acceso denegado: solo los administradores pueden ver esta página.');
      }
    } catch (error) {
      console.error('Error al obtener el perfil del usuario:', error);
      setError('Error al verificar el perfil del usuario');
    }
  };

  useEffect(() => {
    fetchProfile(); // Verifica si el usuario es admin al cargar el componente
    fetchReservas(); // Obtiene las reservas al cargar el componente
  }, []);

  return (
    <div className="reservas">
      <h2>Lista de Reservas</h2>
      {error && <div className="error">{error}</div>}
      <div className="reservas-content">
        {reservas.map((reserva) => (
          <div className="card" key={reserva.id}>
            <div className="reservas-header">
              <span>{reserva.fecha}</span>
              <span>{reserva.hora}</span>
            </div>
            <div className="reserva-info">
              <p><strong>Cancha:</strong> {reserva.cancha}</p>
              <p><strong>Equipo:</strong> {reserva.equipo}</p>
              <p><strong>Email Usuario:</strong> {reserva.email_usuario}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reservas;
