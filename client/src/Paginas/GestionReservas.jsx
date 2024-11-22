import React, { useState } from 'react';
import '../Estilos/GestionReservas.css';
import axios from 'axios';

function GestionReservas() {
  const [cancha, setCancha] = useState({ tipo: '', numero: '' });
  const [equipo, setEquipo] = useState({ nombre: '', cantidad: 1 });
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

      <div className="Container">
        {/* Formulario para agregar cancha */}
        <form onSubmit={(e) => handleSubmit(e, 'canchas', { nombre: `Cancha de ${cancha.tipo} ${cancha.numero}` })}>
          <h3>Agregar Cancha</h3>
          <label>Tipo de Cancha:</label>
          <select
            name="tipo"
            value={cancha.tipo}
            onChange={(e) => handleChange(e, setCancha)}
            required
          >
            <option value="">Selecciona un tipo de cancha</option>
            <option value="Tenis">Tenis</option>
            <option value="Futbol">Fútbol</option>
            <option value="Basquetbol">Básquetbol</option>
            <option value="Voleybol">Vóleibol</option>
          </select>

          <label>Agrega un Número:</label>
          <input
            type="number"
            name="numero"
            value={cancha.numero}
            placeholder="Agrega un Número"
            min="1"
            onChange={(e) => handleChange(e, setCancha)}
          />

          <button type="submit">Agregar Cancha</button>
        </form>

        {/* Formulario para agregar equipo */}
        <form onSubmit={(e) => handleSubmit(e, 'equipos', equipo)}>
          <h3>Agregar Equipo</h3>

          <label>Tipo de Equipo:</label>
          <select
            name="tipo"
            value={equipo.tipo}
            onChange={(e) => handleChange(e, setEquipo)}
            required
          >
            <option value="">Selecciona el tipo de equipo</option>
            <option value="Futbol">Fútbol</option>
            <option value="Basquetbol">Básquetbol</option>
            <option value="Voleybol">Vóleibol</option>
            <option value="Tenis">Tenis</option>
          </select>

          <label>Marca del Equipo:</label>
          <select
            name="nombre"
            value={equipo.nombre}
            onChange={(e) => handleChange(e, setEquipo)}
            required
          >
            <option value="">Selecciona la marca</option>
            <option value="Mitre">Mitre</option>
            <option value="Puma">Puma</option>
            <option value="Molten">Molten</option>
            <option value="Dunlop">Dunlop</option>
            <option value="Wilson">Wilson</option>
            <option value="Spalding">Spalding</option>
            <option value="Adidas">Adidas</option>
            <option value="Nike">Nike</option>
            <option value="Mikasa">Mikasa</option>
          </select>

          <label>Cantidad:</label>
          <input
            type="number"
            name="cantidad"
            value={equipo.cantidad}
            placeholder="Cantidad"
            min="1"
            onChange={(e) => handleChange(e, setEquipo)}
          />
          <button type="submit">Agregar Equipo</button>
        </form>

        {/* Formulario para bloquear fecha y hora */}
        <form onSubmit={(e) => handleSubmit(e, 'reservas-especiales', reservaEspecial)}>
          <h3>Bloquear Fecha y Hora</h3>
          <label>Fecha:</label>
          <input
            type="date"
            name="fecha"
            value={reservaEspecial.fecha}
            onChange={(e) => handleChange(e, setReservaEspecial)}
          />
          <label>Hora:</label>
          <input
            type="time"
            name="hora"
            value={reservaEspecial.hora}
            onChange={(e) => handleChange(e, setReservaEspecial)}
          />
          <label>Motivo de la Reserva:</label>
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
    </div>
  );
}

export default GestionReservas;
