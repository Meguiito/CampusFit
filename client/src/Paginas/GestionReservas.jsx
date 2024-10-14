import React, { useState } from 'react';
import '../Estilos/GestionReservas.css';
import axios from 'axios';

function GestionReservas() {
  const [cancha, setCancha] = useState({ nombre: '', tipo: '' });
  const [equipo, setEquipo] = useState({ nombre: '', cantidad: 0 });
  const [reservaEspecial, setReservaEspecial] = useState({ fecha: '', hora: '', motivo: '' });

  const handleChange = (e, setFunction) => {
    const { name, value } = e.target;
    setFunction((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e, endpoint, data) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:5000/${endpoint}`, data);
      alert('Registro guardado exitosamente');
      console.log(response.data);
    } catch (error) {
      alert('Error al guardar el registro');
      console.error(error);
    }
  };

  return (
    <div className="gestion-reservas">
      <h2>Gestionar Reservas</h2>

      <form onSubmit={(e) => handleSubmit(e, 'canchas', cancha)}>
        <h3>Agregar Cancha</h3>
        <input
          type="text"
          name="nombre"
          value={cancha.nombre}
          placeholder="Nombre de la Cancha"
          onChange={(e) => handleChange(e, setCancha)}
        />
        <input
          type="text"
          name="tipo"
          value={cancha.tipo}
          placeholder="Tipo de Cancha"
          onChange={(e) => handleChange(e, setCancha)}
        />
        <button type="submit">Agregar Cancha</button>
      </form>

      <form onSubmit={(e) => handleSubmit(e, 'equipos', equipo)}>
        <h3>Agregar Equipo</h3>
        <input
          type="text"
          name="nombre"
          value={equipo.nombre}
          placeholder="Nombre del Equipo"
          onChange={(e) => handleChange(e, setEquipo)}
        />
        <input
          type="number"
          name="cantidad"
          value={equipo.cantidad}
          placeholder="Cantidad"
          onChange={(e) => handleChange(e, setEquipo)}
        />
        <button type="submit">Agregar Equipo</button>
      </form>

      <form onSubmit={(e) => handleSubmit(e, 'reservas-especiales', reservaEspecial)}>
        <h3>Bloquear Fecha y Hora</h3>
        <input
          type="date"
          name="fecha"
          value={reservaEspecial.fecha}
          onChange={(e) => handleChange(e, setReservaEspecial)}
        />
        <input
          type="time"
          name="hora"
          value={reservaEspecial.hora}
          onChange={(e) => handleChange(e, setReservaEspecial)}
        />
        <input
          type="text"
          name="motivo"
          value={reservaEspecial.motivo}
          placeholder="Motivo de la Reserva"
          onChange={(e) => handleChange(e, setReservaEspecial)}
        />
        <button type="submit">Bloquear Fecha</button>
      </form>
    </div>
  );
}

export default GestionReservas;
