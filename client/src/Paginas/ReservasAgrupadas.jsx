import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Estilos/ReservasAgrupadas.css';


const ReservasAgrupadas = () => {
    const [reservas, setReservas] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [password, setPassword] = useState('');
    const [deleteReason, setDeleteReason] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReservas();
    }, []);

    const fetchReservas = async () => {
        try {
            const response = await axios.get('http://localhost:5000/admin/reservas-agrupadas', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setReservas(response.data);
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
            const response = await axios.post('http://localhost:5000/admin/eliminar-reserva', {
                reservaId: selectedReserva._id,
                password,
                deleteReason,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
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
                        <h2>{cancha}</h2>
                        <div className="reservas-list">
                            {reservas[cancha].map((reserva) => (
                                <div className="card" key={reserva._id}>
                                    <p><strong>Hora:</strong> {reserva.hora}</p>
                                    <p><strong>Equipo:</strong> {reserva.equipo}</p>
                                    <p><strong>Email:</strong> {reserva.email_usuario}</p>
                                    <button 
                                        className="delete-button" 
                                        onClick={() => handleDeleteClick(reserva)}
                                    >Eliminar</button>
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
                        <p>Para eliminar la reserva, ingresa tu contraseña y motivo:</p>
                        <input 
                            type="password" 
                            placeholder="Contraseña" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                        <textarea 
                            placeholder="Motivo de eliminación" 
                            value={deleteReason} 
                            onChange={(e) => setDeleteReason(e.target.value)} 
                        />
                        <button onClick={confirmDelete}>Confirmar</button>
                        <button onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservasAgrupadas;
