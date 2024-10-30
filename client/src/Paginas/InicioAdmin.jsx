import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Estilos/InicioAdmin.css';
import { logout, isAdmin } from '../Tokens/authService';

const InicioAdmin = () => {
    const [reservas, setReservas] = useState([]);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const fetchProfileData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const profileData = response.data;

                if (profileData.tipo_de_usuario === 'admin') {
                    setIsAdmin(true);
                    fetchReservas();
                } else if (profileData.tipo_de_usuario === 'client') {
                    window.location.href = '/';
                } else {
                    setError('Acceso denegado: solo los administradores pueden ver esta página.');
                }
            } catch (err) {
                setError('Error al verificar el perfil de usuario');
                window.location.href = '/login';
            }
        };

        fetchProfileData();
    }, []);

    const fetchReservas = async () => {
        try {
            const response = await axios.get('http://localhost:5000/reservas-dia', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (Array.isArray(response.data)) {
                setReservas(response.data);
            } else {
                setReservas([]);
            }
        } catch (err) {
            setError(err.response ? err.response.data.message : 'Error al obtener las reservas');
        }
    };

    const handleLogout = () => {
        logout();
    };

    // Mapeo de imágenes de canchas
    const canchaImages = {
        'Cancha de futbol 1': require('../Img/futbol1.png'),
        'Cancha de futbol 2': require('../Img/futbol2.png'),
        'Cancha de futbol 3': require('../Img/futbol3.png'),
        'Cancha de tenis 1': require('../Img/tenis1.png'),
        'Cancha de tenis 2': require('../Img/tenis2.png'),
        'Cancha de tenis 3': require('../Img/tenis3.png')
    };

    const getCanchaImage = (cancha) => {
        return canchaImages[cancha] || require('../Img/default.png'); // Imagen por defecto si no hay coincidencia
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="inicio">
            <h1 style={{ color: 'white' }}>Reservas del Día</h1>
            {error && <div className="error-message">{error}</div>}
            <div className="inicio-content">
                {reservas.length === 0 ? (
                    <p>No hay reservas para mostrar.</p>
                ) : (
                    reservas.map((reserva, index) => (
                        <div className="card" key={index}>
                            <div className="info">
                                <p><strong>Cancha:</strong> {reserva.cancha}</p>
                                <p><strong>Equipo:</strong> {reserva.equipo}</p>
                                <p><strong>Email:</strong> {reserva.email_usuario}</p>
                                <p><strong>Hora:</strong> {reserva.hora}</p>
                            </div>
                            <div className="image-container" style={{
                                backgroundImage: `url(${getCanchaImage(reserva.cancha)})`
                            }}></div>
                        </div>
                    ))
                )}
            </div>
            <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
    );
};

export default InicioAdmin;
