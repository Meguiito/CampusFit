import React, { useState } from 'react';
import styled from 'styled-components';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import es from 'date-fns/locale/es'; // Importa la localización en español

// Registra la localización en español
registerLocale('es', es);

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* Ocupa al menos el alto de la ventana */
  background-color: #f0f2f5; /* Color de fondo suave */
`;

const DatePickerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  .react-datepicker {
    font-size: 1.2rem; /* Tamaño de fuente base */
    width: 100%;
  }

  .react-datepicker__header {
    padding: 10px 0;
    background-color: #2985ec;
    border-bottom: none;
  }

  .react-datepicker__current-month,
  .react-datepicker-time__header,
  .react-datepicker-year-header {
    font-size: 1.4rem;
    color: #FFD700;
  }

  .react-datepicker__day-name,
  .react-datepicker__day,
  .react-datepicker__time-name {
    width: calc(90% / 7); /* Ocupa el 100% del ancho dividido por 7 (días de la semana) */
    height: 3rem; /* Aumenta la altura para que sea más fácil de hacer clic */
    line-height: 3rem; /* Centrar verticalmente */
    font-size: 1.4rem;
    text-align: center;
  }

  .react-datepicker__day-name {
    font-weight: bold;
    color: #FFD700;
  }

  .react-datepicker__day {
    justify-content: center;
    align-items: center;
  }

  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background-color: #FFD700;
    color: #2985ec;
  }

  .react-datepicker__navigation-icon::before {
    border-color: #FFD700;
  }

  /* Oculta el triángulo */
  .react-datepicker__triangle {
    display: none;
  }

  .react-datepicker__month-container {
    width: 100%;
  }

  /* Ajusta el tamaño de los botones de navegación */
  .react-datepicker__navigation {
    top: 10px;
  }

  /* Media Queries para Responsividad */

  /* Tablets (≥ 768px y < 1024px) */
  @media (min-width: 768px) and (max-width: 1023px) {
    .react-datepicker {
      font-size: 1rem;
    }

    .react-datepicker__current-month,
    .react-datepicker-time__header,
    .react-datepicker-year-header {
      font-size: 1.2rem;
    }

    .react-datepicker__day-name,
    .react-datepicker__day,
    .react-datepicker__time-name {
      width: calc(90% / 7); /* Asegura que los días ocupen el mismo espacio en tablets */
      height: 3rem; /* Ajusta la altura para tablets */
      line-height: 3rem; /* Centrar verticalmente en tablets */
      font-size: 1rem;
    }
  }

  /* Móviles (≥ 480px y < 768px) */
  @media (max-width: 767px) {
    .react-datepicker {
      font-size: 0.9rem;
    }

    .react-datepicker__current-month,
    .react-datepicker-time__header,
    .react-datepicker-year-header {
      font-size: 1rem;
    }

    .react-datepicker__day-name,
    .react-datepicker__day,
    .react-datepicker__time-name {
      width: calc(90% / 7); /* Asegura que los días ocupen el mismo espacio en móviles */
      height: 2.5rem; /* Ajusta la altura para móviles */
      line-height: 2.5rem; /* Centrar verticalmente en móviles */
      font-size: 0.9rem;
    }

    .react-datepicker__header {
      padding: 8px 0;
    }

    .react-datepicker__navigation {
      top: 8px;
    }
  }

  /* Dispositivos muy pequeños (< 480px) */
  @media (max-width: 479px) {
    .react-datepicker {
      font-size: 0.8rem; /* Tamaño de fuente más pequeño */
    }

    .react-datepicker__current-month,
    .react-datepicker-time__header,
    .react-datepicker-year-header {
      font-size: 1rem; /* Tamaño de fuente más pequeño para el encabezado */
    }

    .react-datepicker__day-name,
    .react-datepicker__day,
    .react-datepicker__time-name {
      width: calc(90% / 7); /* Asegura que los días ocupen el mismo espacio en dispositivos muy pequeños */
      height: 2rem; /* Ajusta la altura para que sea más manejable */
      line-height: 2rem; /* Centrar verticalmente en dispositivos muy pequeños */
      font-size: 0.8rem; /* Tamaño de fuente más pequeño */
    }

    .react-datepicker__header {
      padding: 6px 0; /* Menos padding en el encabezado */
    }

    .react-datepicker__navigation {
      top: 6px; /* Posición ajustada para los botones de navegación */
    }
  }
`;

function ReservayEquipo() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [time, setTime] = useState('08:00');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const minTime = "08:00";
  const maxTime = "20:00";

  const handleTimeChange = (event) => {
    const newTime = event.target.value;
    if (newTime >= minTime && newTime <= maxTime) {
      setTime(newTime);
    } else {
      setTime(minTime);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError(null);

    const token = localStorage.getItem('token');
    const formData = {
      fecha: selectedDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
      hora: time,
      cancha: cancha,
      equipo: equipo,
    };

    try {
      const response = await fetch('http://localhost:5000/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 201) {
        setMessage('¡Reserva confirmada! Tu tiempo de reservación es de 2 horas.');
      } else if (response.status === 409) {
        const result = await response.json();
        setError(result.error); // Muestra el mensaje de conflicto de horario
      } else {
        setError('Ocurrió un error al realizar la reserva.');
      }
    } catch (error) {
      setError('Error al conectar con el servidor.');
    }
  };

  // Función para calcular el final del semestre actual
  const getSemesterEndDate = () => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11

    let semesterEnd = new Date(today); // Clonar la fecha actual

    if (currentMonth < 6) { // Enero (0) a Junio (5)
      semesterEnd.setMonth(5); // Junio
      semesterEnd.setDate(30);
    } else { // Julio (6) a Diciembre (11)
      semesterEnd.setMonth(11); // Diciembre
      semesterEnd.setDate(31);
    }

    // Si la fecha actual es después del fin del semestre, pasar al siguiente semestre
    if (today > semesterEnd) {
      if (currentMonth < 6) {
        // Actualmente en primer semestre, pasar al segundo
        semesterEnd.setMonth(11);
        semesterEnd.setDate(31);
      } else {
        // Actualmente en segundo semestre, pasar al siguiente año primer semestre
        semesterEnd = new Date(today.getFullYear() + 1, 5, 30);
      }
    }

    return semesterEnd;
  };

  const minDate = new Date(); // Día actual
  const maxDate = getSemesterEndDate(); // Final del semestre

  // Estados para cancha y equipo
  const [cancha, setCancha] = useState('');
  const [equipo, setEquipo] = useState('');

  return (
    <Wrapper>
      <FormularioContainer>
        <h2>Reserva tu Hora y Equipo</h2>
        <form onSubmit={handleSubmit}>
          <Fecha>
            <Label>Selecciona el Día:</Label>
            <DatePickerWrapper>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                inline
                minDate={minDate}
                maxDate={maxDate}
                dateFormat="P" // Formato de fecha adaptado al locale
                locale="es" // Establece el locale a español
                required
              />
            </DatePickerWrapper>
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
              step="1800"
              onChange={handleTimeChange}
              required
            />
          </Hora>
          <Cancha>
            <Label htmlFor="cancha">Selecciona la Cancha:</Label>
            <Select
              id="cancha"
              name="cancha"
              value={cancha}
              onChange={(e) => setCancha(e.target.value)}
              required
            >
              <option value="">Selecciona una cancha</option>
              <option value="Cancha 1">Cancha 1</option>
              <option value="Cancha 2">Cancha 2</option>
              <option value="Cancha 3">Cancha 3</option>
              <option value="Cancha 4">Cancha 4</option>
            </Select>
          </Cancha>
          <Equipo>
            <Label htmlFor="equipo">Selecciona tu Equipo:</Label>
            <Select
              id="equipo"
              name="equipo"
              value={equipo}
              onChange={(e) => setEquipo(e.target.value)}
              required
            >
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
        {error && <ErrorNotification>{error}</ErrorNotification>}
      </FormularioContainer>
    </Wrapper>
  );
}

export default ReservayEquipo;

// Estilos
const FormularioContainer = styled.div`
  background: linear-gradient(135deg, #3498DB, #ffffff);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  margin: 20px;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  max-width: 600px; /* Reducido para hacer el contenedor más delgado */
  width: 90%;

  h2 {
    color: white;
    text-align: center;
    margin-bottom: 20px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-width: 100%;
    width: 100%;
    background-color: #2985ec;
    border-radius: 15px;
    padding: 20px;
    color: #FFD700;
  }
`;

const Fecha = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  label {
    margin-bottom: 5px;
    font-weight: bold;
    color: white;
    font-size: 1.2rem;
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

const ErrorNotification = styled.div`
  margin-top: 20px;
  background-color: #ff6347;
  color: white;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  width: 100%;
  max-width: 600px; 
`;
