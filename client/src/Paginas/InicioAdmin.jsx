import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Estilos/InicioAdmin.css';

const InicioAdmin = () => {
    const [reservas, setReservas] = useState([]); // Inicialmente un arreglo vacío
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReservas = async () => {
            try {
                const response = await axios.get('http://localhost:5000/reservas-dia', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}` // Asegúrate de que estás usando el token correcto
                    }
                });
                
                // Asegúrate de que response.data sea un arreglo
                if (Array.isArray(response.data)) {
                    setReservas(response.data);
                } else {
                    setReservas([]); // Si no es un arreglo, establece reservas como vacío
                }
            } catch (err) {
                setError(err.response ? err.response.data.message : 'Error al obtener las reservas');
            }
        };

        fetchReservas();
    }, []);

    return (
        <div className="inicio">
            <h1 style={{ color: 'white' }}>Reservas del Día</h1>
            {error && <div className="error-message">{error}</div>}
            <div className="inicio-content">
                {reservas.length === 0 ? (
                    <p>No hay reservas para mostrar.</p> // Mensaje cuando reservas está vacío
                ) : (
                    reservas.map((reserva, index) => (
                        <div className="card" key={index}>
                            <p>Cancha: {reserva.cancha}</p>
                            <p>Equipo: {reserva.equipo}</p>
                            <p>Email: {reserva.email_usuario}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default InicioAdmin;
