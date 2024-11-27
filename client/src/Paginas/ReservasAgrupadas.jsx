import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Estilos/ReservasAgrupadas.css';

const ReservasAgrupadas = () => {
    const [reservas, setReservas] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [error, setError] = useState(null);

    const canchaImages = {
        'Cancha de futbol 1': require('../Img/futbol1.png'),
        'Cancha de futbol 2': require('../Img/futbol2.png'),
        'Cancha de futbol 3': require('../Img/futbol3.png'),
        'Cancha de tenis 1': require('../Img/tenis1.png'),
        'Cancha de tenis 2': require('../Img/tenis2.png'),
        'Cancha de tenis 3': require('../Img/tenis3.png'),
    };

    const getCanchaImage = (cancha) => {
        return canchaImages[cancha] || require('../Img/default.png');
    };

    useEffect(() => {
        fetchReservas();
    }, []);

    const fetchReservas = async () => {
        try {
            const response = await axios.get('http://localhost:5000/admin/reservas-agrupadas', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const reservasAgrupadas = response.data.reduce((acc, reserva) => {
                const { cancha } = reserva;
                if (!acc[cancha]) acc[cancha] = [];
                acc[cancha].push(reserva);
                return acc;
            }, {});
            setReservas(reservasAgrupadas);
        } catch (err) {
            setError('Error al obtener las reservas');
        }
    };

    const handleDeleteClick = (reserva) => {
        setSelectedReserva(reserva);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await axios.post(
                'http://localhost:5000/admin/eliminar-reserva',
                { reservaId: selectedReserva._id },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );

            if (response.data.success) {
                alert(`Reserva eliminada exitosamente. Email del usuario: ${response.data.email_usuario}`);
                fetchReservas();
                setShowDeleteModal(false);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Error al eliminar la reserva');
        }
    };

    return (
        <div className="reservas-agrupadas">
            <h1>Administrar Reservas</h1>
            {error && <p className="error-message">{error}</p>}
            <div className="cancha-container">
                {Object.keys(reservas).map((cancha, index) => (
                    <div key={index} className="cancha-section">
                        <div className="cancha-header">
                            <h2>{cancha}</h2>
                            <img src={getCanchaImage(cancha)} alt={cancha} className="cancha-image" />
                        </div>
                        <div className="reservas-list">
                            {Array.isArray(reservas[cancha]) &&
                             reservas[cancha].map((reserva) => (
                                <div className="card" key={reserva._id}>
                                    <p>
                                    <strong>Fecha:</strong> {reserva.fecha || 'No disponible'}
                                    </p>
                                    <p>
                                    <strong>Hora:</strong> {reserva.hora}
                                    </p>
                                    <p>
                                    <strong>Equipo:</strong> {reserva.equipo}
                                    </p>
                                    <p>
                                    <strong>Email:</strong> {reserva.email_usuario}
                                    </p>
                                <button
                                    className="delete-button"
                                    onClick={() => handleDeleteClick(reserva)}
                                >
                                    Eliminar
                                </button>
            </div>
        ))}
</div>

                    </div>
                ))}
            </div>

            {showDeleteModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Confirmar Eliminación</h2>
                        <p>¿Estás seguro de eliminar esta reserva?</p>
                        <button onClick={confirmDelete}>Sí</button>
                        <button onClick={() => setShowDeleteModal(false)}>No</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservasAgrupadas;
