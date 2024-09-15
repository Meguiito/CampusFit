import React, { useState } from 'react';
import styled from 'styled-components';

function ReservayEquipo() {
  const [time, setTime] = useState('08:00');
  const [message, setMessage] = useState('');

  // Define el rango de horas
  const minTime = "08:00";
  const maxTime = "20:00";

  const handleTimeChange = (event) => {
    const newTime = event.target.value;
    // Verifica que el tiempo esté dentro del rango permitido
    if (newTime >= minTime && newTime <= maxTime) {
      setTime(newTime);
    } else {
      // Ajusta el tiempo a los límites si está fuera de rango
      setTime(minTime);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Mostrar notificación de reserva de 2 horas
    setMessage('¡Reserva confirmada! Tu tiempo de reservación es de 2 horas.');
  };

  const currentYear = new Date().getFullYear();
  const minDate = `${currentYear}-01-01`;
  const maxDate = `${currentYear}-12-31`;

  return (
    <FormularioContainer>
      <h2>Reserva tu Hora y Equipo</h2>
      <form onSubmit={handleSubmit}>
        <Fecha>
          <Label htmlFor="fecha">Selecciona el Día:</Label>
          <Input
            type="date"
            id="fecha"
            name="fecha"
            min={minDate}
            max={maxDate}
            required
          />
        </Fecha>
        <Hora>
          <Label htmlFor="hora">Selecciona la Hora:</Label>
          <Input
            type="time"
            id="hora"
            name="hora"
            value={time}
            min={minTime}
            max={maxTime}
            step="1800" // Intervalo de 30 minutos
            onChange={handleTimeChange}
            required
          />
        </Hora>
        <Cancha>
          <Label htmlFor="cancha">Selecciona la Cancha:</Label>
          <Select id="cancha" name="cancha" required>
            <option value="">Selecciona una cancha</option>
            <option value="Cancha 1">Cancha 1</option>
            <option value="Cancha 2">Cancha 2</option>
            <option value="Cancha 3">Cancha 3</option>
            <option value="Cancha 4">Cancha 4</option>
          </Select>
        </Cancha>
        <Equipo>
          <Label htmlFor="equipo">Selecciona tu Equipo:</Label>
          <Select id="equipo" name="equipo" required>
            <option value="">Selecciona un equipo</option>
            <option value="Equipo A">Equipo A</option>
            <option value="Equipo B">Equipo B</option>
            <option value="Equipo C">Equipo C</option>
            <option value="Equipo D">Equipo D</option>
          </Select>
        </Equipo>
        <Button type="submit">Reservar</Button>
      </form>
      {message && <Notification>{message}</Notification>}
    </FormularioContainer>
  );
}

export default ReservayEquipo;

const FormularioContainer = styled.div`
  background: linear-gradient(135deg, #3498DB, #ffffff);
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  margin: 20px;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);

  h2 {
    color: white;
    text-align: center;
    margin-bottom: 20px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-width: 90%;
    width: 600px;
    background-color: #2985ec;
    border-radius: 15px;
    padding: 20px;
    color: #FFD700;
  }
`;

const Fecha = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  label {
    margin-bottom: 5px;
    font-weight: bold;
    color: white;
  }
`;

const Hora = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  label {
    margin-bottom: 5px;
    font-weight: bold;
    color: white;
  }
`;

const Cancha = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  label {
    margin-bottom: 5px;
    font-weight: bold;
    color: white;
  }
`;

const Equipo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  label {
    margin-bottom: 5px;
    font-weight: bold;
    color: white;
  }
`;

const Label = styled.label`
  font-weight: bold;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  box-sizing: border-box;
  width: 100%;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  box-sizing: border-box;
  width: 100%;
`;

const Button = styled.button`
  background-color: #FFD700;
  border: none;
  border-radius: 5px;
  color: black;
  padding: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;

  &:hover {
    background-color: #1e6bb8;
    color: white;
  }
`;

const Notification = styled.div`
  margin-top: 20px;
  background-color: #00CED1;
  color: white;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  width: 100%;
  max-width: 600px;
`;