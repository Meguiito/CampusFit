import React, { useEffect, useState } from 'react';
import '../Estilos/ReservasEspeciales.css';

function ReservasEspeciales() {
  const [error, setError] = useState("");
  const [reservasEspeciales, setReservasEspeciales] = useState([]);
  const [mesesReservados, setMesesReservados] = useState([]);
  const [diasReservados, setDiasReservados] = useState([]);
  const [horasDesdeReservadas, setHorasDesdeReservadas] = useState([]);
  const [horasHastaReservadas, setHorasHastaReservadas] = useState([]);
  const [canchasReservadas, setcanchasReservadas] = useState([]);
  const [equiposReservados, setequiposReservados] = useState([]);

  const setErrorWithTimeout = (message) => {
    setError(message);
    setTimeout(() => setError(""), 2000);
  };

  const fetchReservasEspeciales = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorWithTimeout('No se encontró el token de autenticación.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/get_special_requests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReservasEspeciales(data);
      } else {
        const errorData = await response.json();
        setErrorWithTimeout(errorData.error || 'Error al obtener las reservas especiales.');
      }
    } catch (error) {
      console.error('Error de red:', error);
      setErrorWithTimeout('Error al conectar con el servidor.');
    }
  };

  useEffect(() => {
    fetchReservasEspeciales();
  }, []);

  const obtenerMeses = () => {
    const mesesReservadosActualizados = reservasEspeciales
      .filter(reserva => reserva.tipo === "DG")
      .map(reserva => Object.keys(reserva.meses).filter(mes => reserva.meses[mes]));

    setMesesReservados(mesesReservadosActualizados);
  };

  const obtenerDias = () => {
    const diasReservadosActualizados = reservasEspeciales
      .filter(reserva => reserva.tipo === "DG")
      .map(reserva => Object.keys(reserva.dias).filter(dia => reserva.dias[dia].seleccionado));

    setDiasReservados(diasReservadosActualizados);
  };

  const obtenerHoraDesde = () => {
    const horaDesdeActualizados = reservasEspeciales
      .filter(reserva => reserva.tipo === "DG")
      .map(reserva => Object.keys(reserva.dias)
        .filter(dia => reserva.dias[dia].seleccionado)
        .map(dia => reserva.dias[dia].horaDesde));

    setHorasDesdeReservadas(horaDesdeActualizados);
  };

  const obtenerHoraHasta = () => {
    const horaHastaActualizados = reservasEspeciales
      .filter(reserva => reserva.tipo === "DG")
      .map(reserva => Object.keys(reserva.dias)
        .filter(dia => reserva.dias[dia].seleccionado)
        .map(dia => reserva.dias[dia].horaHasta));

    setHorasHastaReservadas(horaHastaActualizados);
  };

  const obtenerCanchas = () => {
    const canchasActualizadas = reservasEspeciales
      .filter(reserva => reserva.tipo === "DG")
      .map(reserva => Object.keys(reserva.dias)
        .filter(dia => reserva.dias[dia].seleccionado)
        .map(dia => reserva.dias[dia].cancha));

    setcanchasReservadas(canchasActualizadas);
  };

  const obtenerEquipos = () => {
    const equiposActualizados = reservasEspeciales
      .filter(reserva => reserva.tipo === "DG")
      .map(reserva => Object.keys(reserva.dias)
        .filter(dia => reserva.dias[dia].seleccionado)
        .map(dia => reserva.dias[dia].equipo));

    setequiposReservados(equiposActualizados);
  };


  useEffect(() => {
    if (reservasEspeciales.length > 0) {
      obtenerMeses();
      obtenerDias();
      obtenerHoraDesde();
      obtenerHoraHasta();
      obtenerCanchas();
      obtenerEquipos();
    }
  }, [reservasEspeciales]);

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <h1>Meses Reservados</h1>
      <pre>{JSON.stringify(mesesReservados, null, 2)}</pre>
      <h1>Días Reservados</h1>
      <pre>{JSON.stringify(diasReservados, null, 2)}</pre>
      <h1>Horas Desde Reservadas</h1>
      <pre>{JSON.stringify(horasDesdeReservadas, null, 2)}</pre>
      <h1>Horas Hasta Reservadas</h1>
      <pre>{JSON.stringify(horasHastaReservadas, null, 2)}</pre>
      <h1>Canchas Reservadas</h1>
      <pre>{JSON.stringify(canchasReservadas, null, 2)}</pre>
      <h1>Equipos Reservados</h1>
      <pre>{JSON.stringify(equiposReservados, null, 2)}</pre>
    </div>
  );
}

export default ReservasEspeciales;
