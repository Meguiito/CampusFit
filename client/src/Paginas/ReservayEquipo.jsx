import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import es from 'date-fns/locale/es';
import "../Estilos/Reservas.css"
registerLocale('es', es);

function ReservayEquipo() {
  const navigate = useNavigate(); 
  const obtenerProximaFechaHabil = () => {
    const hoy = new Date();
    const dia = hoy.getDay(); 

    if (dia === 6) { 
      hoy.setDate(hoy.getDate() + 2); 
    } else if (dia === 0) { 
      hoy.setDate(hoy.getDate() + 1); 
    }

    return hoy;
  };

  const calcularFechaMaxima = (fechaMinima) => {
    const fechaMax = new Date(fechaMinima);
  
    const mesActual = fechaMinima.getMonth();
    const semestreActual = Math.floor(mesActual / 6) + 1;
  
    if (semestreActual === 1) {
      fechaMax.setFullYear(fechaMinima.getFullYear(), 5, 30); 
    } else {
      fechaMax.setFullYear(fechaMinima.getFullYear(), 11, 31); 
    }
  
    const dia = fechaMax.getDay();
    if (dia === 6) { // Sábado
      fechaMax.setDate(fechaMax.getDate() - 1); 
    } else if (dia === 0) { // Domingo
      fechaMax.setDate(fechaMax.getDate() - 2); 
    }
  
    return fechaMax;
  };
  

  const fechaMinima = obtenerProximaFechaHabil();
  const fechaMaxima = calcularFechaMaxima(fechaMinima);

  const [disp, setDis] = useState(null);
  const [selectedDate, setSelectedDate] = useState(obtenerProximaFechaHabil());
  const [time, setTime] = useState(null);
  const [error, setError] = useState(null);
  const [cancha, setCancha] = useState('');
  const [canchaTipo, setCanchaTipo] = useState('');
  const [equipo, setEquipo] = useState('');
  const [canchasReservadas, setCanchasReservadas] = useState([]);
  const [equiposReservados, setEquiposReservados] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [horasNoDisponibles, setHorasNoDisponibles] = useState([]);
  
  useEffect(() => {
    const fetchCanchasYEquipos = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No se encontró el token de autenticación.');
        return;
      }
    
      try {
        const response = await fetch('http://localhost:5000/api/canchas_equipo', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
    
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setCanchas(data.canchas_disponibles);
          setEquipos(data.equipos_disponibles);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Error al obtener los datos.');
        }
      } catch (error) {
        setError('Error de red: ' + error.message);
      }
    };

    fetchCanchasYEquipos()
  }, [])

  useEffect(() => {
    const fetchCanchasYEquiposReservados = async () => {
      try {
        const body = {
          fecha: selectedDate.toLocaleDateString('es-CL'), // Formato YYYY-MM-DD
          hora: null,
        };
        if (time) {
          body.hora = time;
        } 

        const response = await fetch('http://localhost:5000/api/equipo_and_canchas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(body)
        });

        if (response.ok) {
          const data = await response.json();
          if (time) {
            setCanchasReservadas(data.canchas_reservadas);
            setEquiposReservados(data.equipos_reservados);
          } else {
            console.log(data.horas_no_disponibles)
            setHorasNoDisponibles(data.horas_no_disponibles);
          }
        } else {
          console.error('Error en la solicitud:', response.statusText);
        }
      } catch (error) {
        console.error('Error en la solicitud:', error);
      }
    };

    if(selectedDate){
      fetchCanchasYEquiposReservados();
    }
  }, [selectedDate, time])

  useEffect(() => {
    const verificarReservas = async () => {
      setError(null);
      const token = localStorage.getItem('token');
      const formData = {
        fecha: selectedDate.toLocaleDateString('es-CL'),
      };

      try {
        const response = await fetch('http://localhost:5000/api/verificar_reservas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setDis(true);
        } else if (response.status === 409) {
          const result = await response.json();
          setDis(false);
          setError(result.error);
        } else if (response.status === 410) {
          const result = await response.json();
          setDis(false);
          alert(result.error);
          navigate("/TuReservacion");
        }

      } catch (error) {
        setError('Error al conectar con el servidor.');
      }
    };

    if(selectedDate){
      verificarReservas()
    }
  }, [selectedDate, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const token = localStorage.getItem('token');
    const formData = {
      fecha: selectedDate.toLocaleDateString('es-CL'), // Formato YYYY-MM-DD
      hora: time,
      cancha: cancha,
      equipo: equipo,
    };

    try {
      const response = await fetch('http://localhost:5000/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 201) {
        alert("Se ha reservado con éxito");
        navigate("/TuReservacion"); 
      } else if (response.status === 409) {
        const result = await response.json();
        setError(result.error); 
      } else {
        setError('Ocurrió un error al realizar la reserva.');
      }
    } catch (error) {
      setError('Error al conectar con el servidor.');
    }
  };

    const generarOpcionesTiempo = () => {
      const opciones = [];
      for (let hora = 8; hora <= 18; hora += 2) {
        const horaFormateada = hora.toString().padStart(2, '0') + ':00';
        const isDisabled = horasNoDisponibles.includes(horaFormateada);
    
        opciones.push(
          <option 
            key={horaFormateada} 
            value={horaFormateada} 
            disabled={isDisabled || esHoraPasada(horaFormateada)}
            className={isDisabled ? 'hora-no-disponible' : ''}
          >
            {horaFormateada}
          </option>
        );
      }
      return opciones;
    };

  

  const esHoraPasada = (horaSeleccionada) => {
    const hoy = new Date();
    const fechaSeleccionada = selectedDate.toDateString() === hoy.toDateString();

    if (!fechaSeleccionada) return false;

    const [hora, minuto] = horaSeleccionada.split(':').map(Number);
    const ahora = new Date();
    return hora < ahora.getHours() || (hora === ahora.getHours() && minuto < ahora.getMinutes());
  };


  const generarOpcionesCancha = () => {
    return (canchas || []).map((cancha) => {
      const isReserved = canchasReservadas.includes(cancha.nombre);
      return (
        <option 
          key={cancha._id} 
          value={cancha.nombre} 
          disabled={isReserved}
          className={isReserved ? 'cancha-reservada' : ''}
        >
          {cancha.nombre}
        </option>
      );
    });
  };
  
  
  const handleCanchaChange = (e) => {
    const canchaNombre = e.target.value;
    setCancha(canchaNombre);

    const canchaSeleccionada = canchas.find(c => c.nombre === canchaNombre);
    if (canchaSeleccionada) {
      setCanchaTipo(canchaSeleccionada.tipo);
    } else {
      setCanchaTipo('');
    }
  };

  const generarOpcionesEquipo = () => {    
    const equiposfiltrados = equipos.filter(equipo => equipo.tipo === canchaTipo)
    return (equiposfiltrados || []).map((equipo) => {
      const isReserved = equiposReservados.includes(equipo.nombre);
      return (
        <option 
          key={equipo._id} 
          value={equipo.nombre} 
          disabled={isReserved}
          className={isReserved ? 'equipo-reservado' : ''}
        >
          {equipo.nombre}
        </option>
      );
    });
  };

  return (
    <div className="wrapper">
      <div className="formulario-container">
        <h2>Reserva tu Hora y Equipo</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="fecha-group">
            <label>Selecciona el Día:</label>
            <div className="datepicker-wrapper">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                inline
                minDate={fechaMinima}
                maxDate={fechaMaxima}
                filterDate={(date) => {
                  const day = date.getDay();
                  return day !== 0 && day !== 6;
                }}
                dateFormat="P"
                locale="es"
                required
                showMonthDropdown={false}
                showYearDropdown={false}
                dropdownMode="select"
              />
            </div>
          </div>
          <div className="hora-group">
            <label htmlFor="hora">Selecciona la Hora:</label>
            <select
              id="hora"
              name="hora"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="select"
              disabled={!disp}
              required
            >
              <option value="">Selecciona una hora</option>
              {generarOpcionesTiempo()}
            </select>
          </div>
          <div className="cancha-group">
            <label htmlFor="cancha">Selecciona la Cancha:</label>
            <select
              id="cancha"
              name="cancha"
              value={cancha}
              onChange={handleCanchaChange}
              className="select"
              required
              disabled={!disp || !time}
            >
              <option value="">Selecciona una cancha</option>
              {generarOpcionesCancha()}
            </select>
          </div>
          <div className="equipo-group">
            <label htmlFor="equipo">Selecciona tu Equipo:</label>
            <select
              id="equipo"
              name="equipo"
              value={equipo}
              onChange={(e) => setEquipo(e.target.value)}
              className="select"
              required
              disabled={!disp || !time || !canchaTipo}
            >
              <option value="">Selecciona un equipo</option>
              {generarOpcionesEquipo()}
            </select>
          </div>
          <button type="submit" className="button">Reservar</button>
        </form>
        {error && <div className="error-notification">{error}</div>}
      </div>
    </div>
  );
}

export default ReservayEquipo;

