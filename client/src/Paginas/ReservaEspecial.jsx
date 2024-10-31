import React, { useState, useEffect } from "react";
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 
import es from 'date-fns/locale/es';
import "../Estilos/ReservaEspecial.css"
registerLocale('es', es);

function ReservaEspecial() {

  const obtenerProximaFechaHabil = () => {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 3); 
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
    if (dia === 6) { 
      fechaMax.setDate(fechaMax.getDate() - 1); 
    } else if (dia === 0) { 
      fechaMax.setDate(fechaMax.getDate() - 2); 
    }
  
    return fechaMax;
  };

  const fechaMinima = obtenerProximaFechaHabil();
  const fechaMaxima = calcularFechaMaxima(fechaMinima);
  const [diaActual] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [mesesDisponibles, setMesesDisponibles] = useState([]);
  const [reservarDiaEspecifico, setReservarDiaEspecifico] = useState(false);
  const [canchasDisponibles, setCanchasDisponibles] = useState([]);
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const horas = [];

  const [formData, setFormData] = useState({
    meses: {
      Enero: false,
      Febrero: false,
      Marzo: false,
      Abril: false,
      Mayo: false,
      Junio: false,
      Julio: false,
      Agosto: false,
      Septiembre: false,
      Octubre: false,
      Noviembre: false,
      Diciembre: false,
    },
    dias: {
      Lunes: { horaDesde: "08:00", horaHasta: "10:00", seleccionado: false, cancha: '', equipo: '' },
      Martes: { horaDesde: "08:00", horaHasta: "10:00", seleccionado: false, cancha: '', equipo: '' },
      Miércoles: { horaDesde: "08:00", horaHasta: "10:00", seleccionado: false, cancha: '', equipo: '' },
      Jueves: { horaDesde: "08:00", horaHasta: "10:00", seleccionado: false, cancha: '', equipo: '' },
      Viernes: { horaDesde: "08:00", horaHasta: "10:00", seleccionado: false, cancha: '', equipo: '' },
    },
    dia_esp: {
      fecha: fechaMinima.toLocaleDateString('es-CL'),
      horaDesde: "08:00",
      horaHasta: "10:00",
      cancha: '',
      equipo: '',
    }
  });

  const [equiposFiltrados, setEquiposFiltrados] = useState({
    Lunes: [],
    Martes: [],
    Miércoles: [],
    Jueves: [],
    Viernes: [],
  }); 

  const [equipos_Filtrados_DE, setEquiposFiltrados_DE] = useState([]);

  for (let h = 8; h <= 20; h += 2) {
    const hour = h < 10 ? `0${h}:00` : `${h}:00`;
    horas.push(hour);
  }
  const [horaDesdeSeleccionada, setHoraDesdeSeleccionada] = useState({
    Lunes: "08:00",
    Martes: "08:00",
    Miércoles: "08:00",
    Jueves: "08:00",
    Viernes: "08:00",
  });

  const setErrorWithTimeout = (message) => {
    setError(message);
    setTimeout(() => {
      setError("");
    }, 2000);
  };
  
  const fetchCanchasYEquipos = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorWithTimeout('No se encontró el token de autenticación.');
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
        setCanchasDisponibles(data.canchas_disponibles);
        setEquiposDisponibles(data.equipos_disponibles);
      } else {
        const errorData = await response.json();
        setErrorWithTimeout(errorData.error || 'Error al obtener los datos.')
      }
    } catch (error) {
      console.error('Error de red:', error);
      setErrorWithTimeout('Error al conectar con el servidor.')
    }
  };

  useEffect(() => {
    fetchCanchasYEquipos();
  });

  useEffect(() => {
    if (selectedDate) {
      const nuevafecha = selectedDate.toLocaleDateString('es-CL');

      setFormData((prevState) => ({
        ...prevState,
        dia_esp: {
          ...prevState.dia_esp,
          fecha: nuevafecha, 
        },
      }));
    }
  }, [selectedDate]); 

  useEffect(() => {
    const mesActual = diaActual.getMonth();
    const semestreActual = Math.floor(mesActual / 6) + 1;

    const meses = semestreActual === 1
      ? ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"]
      : ["Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const mesesFiltrados = meses.slice(mesActual % 6);
    const mesesSeleccionables = mesesFiltrados.map(mes => ({
      nombre: mes,
      seleccionado: false,
    }));

    setMesesDisponibles(mesesSeleccionables);

  }, [diaActual]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);  
      } else {
        setErrorWithTimeout('Por favor, selecciona un archivo PDF.')
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null); 
    setError("");
  };
  
  const convertToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleHourChange = (dia, tipo, valor) => {
    setFormData((prevState) => {

      if (!reservarDiaEspecifico) {
        if (tipo === "horaHasta" && convertToMinutes(valor) < convertToMinutes(prevState.dias[dia].horaDesde)) {
          console.log("La hora de 'horaHasta' debe ser mayor o igual a 'horaDesde'");
          return prevState; 
        }
  
        if (tipo === "horaDesde") {
          const nuevaHoraHasta = convertToMinutes(prevState.dias[dia].horaHasta) <= convertToMinutes(valor)
            ? horas.find(hora => convertToMinutes(hora) > convertToMinutes(valor)) || prevState.dias[dia].horaHasta
            : prevState.dias[dia].horaHasta;
  
          setHoraDesdeSeleccionada(prevState => ({
            ...prevState,
            [dia]: valor
          }));
  
          return {
            ...prevState,
            dias: {
              ...prevState.dias,
              [dia]: {
                ...prevState.dias[dia],
                [tipo]: valor,
                horaHasta: nuevaHoraHasta,
              },
            },
          };
        }
  
        return {
          ...prevState,
          dias: {
            ...prevState.dias,
            [dia]: {
              ...prevState.dias[dia],
              [tipo]: valor,
            },
          },
        };
  
      } else if (dia === 1) {
        if (tipo === "horaHasta" && convertToMinutes(valor) < convertToMinutes(prevState.dia_esp.horaDesde)) {
          console.log("La hora de 'horaHasta' debe ser mayor o igual a 'horaDesde'");
          return prevState; 
        }
  
        if (tipo === "horaDesde") {
          const nuevaHoraHasta = convertToMinutes(prevState.dia_esp.horaHasta) <= convertToMinutes(valor)
            ? horas.find(hora => convertToMinutes(hora) > convertToMinutes(valor)) || prevState.dia_esp.horaHasta
            : prevState.dia_esp.horaHasta;
  
          return {
            ...prevState,
            dia_esp: {
              ...prevState.dia_esp,
              horaDesde: valor, 
              horaHasta: nuevaHoraHasta, 
            },
          };
        }
      }
  
      return {
        ...prevState,
        dia_esp: {
          ...prevState.dia_esp,
          [tipo]: valor,
        },
      };
    });
  };
  
  const horasHastaDisponibles = (dia) => horas.filter(hora => convertToMinutes(hora) > convertToMinutes(horaDesdeSeleccionada[dia]));
  const horaHastaDispDE = horas.filter(hora => convertToMinutes(hora) > convertToMinutes(formData.dia_esp.horaDesde))

  const handleCheckboxChange = (dia) => {
    setFormData((prevState) => ({
      ...prevState,
      dias: {
        ...prevState.dias,
        [dia]: {
          ...prevState.dias[dia],
          seleccionado: !prevState.dias[dia].seleccionado,
        },
      },
    }));
  };

  const handleMonthChange = (mes) => {
    setFormData((prevState) => ({
      ...prevState,
      meses: {
        ...prevState.meses,
        [mes]: !prevState.meses[mes],
      },
    }));
  };

  const toggleReservarDiaEspecifico = () => {
    setReservarDiaEspecifico(!reservarDiaEspecifico);
    setSelectedDate(null);
  };

  const handleCanchaChange = (dia, e) => {
    const canchaNombre = e.target.value;
  
    if (canchaNombre === '') {
      if (!reservarDiaEspecifico) {
        setFormData((prevState) => {
          const diaData = prevState.dias[dia];
          return {
            ...prevState,
            dias: {
              ...prevState.dias,
              [dia]: {
                ...diaData,
                cancha: '', 
                equipo: '', 
              },
            },
          };
        });
        setEquiposFiltrados((prevState) => ({
          ...prevState,
          [dia]: [], 
        }));
      } else if (dia === 1) {
        setFormData((prevState) => ({
          ...prevState,
          dia_esp: {
            ...prevState.dia_esp,
            cancha: '',
            equipo: '', 
          },
        }));
        setEquiposFiltrados_DE([]); 
      }
      return;
    }
  
    const canchaSeleccionada = canchasDisponibles.find(c => c.nombre === canchaNombre);
    const canchaTipo = canchaSeleccionada ? canchaSeleccionada.tipo : '';
  
    if (!canchaSeleccionada) {
      console.log("Cancha no encontrada");
      return;
    }
  
    if (!reservarDiaEspecifico) {
      setFormData((prevState) => {
        const diaData = prevState.dias[dia];
  
        return {
          ...prevState,
          dias: {
            ...prevState.dias,
            [dia]: {
              ...diaData,
              cancha: canchaNombre, 
              equipo: canchaSeleccionada ? '' : diaData.equipo, 
            },
          },
        };
      });
  
      const equiposFiltradosDG = equiposDisponibles.filter(equipo => equipo.tipo === canchaTipo);
      setEquiposFiltrados((prevState) => ({
        ...prevState,
        [dia]: equiposFiltradosDG,
      }));
  
    } else if (dia === 1) {
      setFormData((prevState) => ({
        ...prevState,
        dia_esp: {
          ...prevState.dia_esp,
          cancha: canchaNombre, 
          equipo: canchaSeleccionada ? '' : prevState.dia_esp.equipo, 
        },
      }));
  
      const equiposFiltrados_DE = equiposDisponibles.filter(equipo => equipo.tipo === canchaTipo);
      setEquiposFiltrados_DE(equiposFiltrados_DE);
    }
  };
  
const handleEquipoChange = (dia, e) => {
    const equipoSeleccionado = e.target.value;

    setFormData((prevState) => {
      if(!reservarDiaEspecifico){
          const diaData = prevState.dias[dia];

          return {
              ...prevState,
              dias: {
                  ...prevState.dias,
                  [dia]: {
                      ...diaData,
                      equipo: equipoSeleccionado, 
                  },
              },
          };
       } else if(dia === 1){
         return {
           ...prevState,
           dia_esp: {
             ...prevState.dia_esp,
             equipo: equipoSeleccionado,
           },
        };
      }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorWithTimeout('No se encontró el token de autenticación.');
      return;
    }

    try {
      const formDataENVIO = new FormData();
      if(!reservarDiaEspecifico){
        formDataENVIO.append('file', selectedFile);
        formDataENVIO.append('meses', JSON.stringify(formData.meses));
        formDataENVIO.append('dias', JSON.stringify(formData.dias));

      } else if(reservarDiaEspecifico){
        formDataENVIO.append('file', selectedFile);
        formDataENVIO.append('dia_esp', JSON.stringify(formData.dia_esp));
      }

      console.log("Datos antes del envío:", formDataENVIO);

      const response = await fetch("http://localhost:5000/special_request", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formDataENVIO,
      });

      if (response.ok) {
        alert("La reserva especial fue enviada para su revisión.");
      } else {
        const errorData = await response.json();
        setErrorWithTimeout(errorData.error || "Error en el envío del formulario.");
      }
    } catch (error) {
      console.error("Error de red:", error);
      setErrorWithTimeout("Error al conectar con el servidor.");
    }
};

  
return (
  <div id="container-boss" className="container-boss">
    <div id="formulario-container" className="formulario-container">
      <h2 className="titulo">Reserva Especial</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="formulario">
        <div className="form-group" id="archivo-group">
          <label htmlFor="archivo" className="label">Subir archivo (PDF):</label>
          
          <div className="pdf">
            <input 
              type="file"
              id="archivo"
              name="archivo"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: "none" }} 
            />
          </div>
          
          <div className="seleccionar-archivo">
            <button
              type="button"
              className="btn-seleccionar-archivo"
              onClick={() => document.getElementById("archivo").click()}
            >
              Seleccionar archivo
            </button>
          </div>
          {selectedFile && (
            <div className="archivo-seleccionado">
              <p className="archivo-nombre">Archivo seleccionado: {selectedFile.name}</p>
              <button className="btn-borrar-archivo" onClick={handleRemoveFile}>
                Borrar archivo
              </button>
            </div>
          )}
        </div>

        <div className="form-group" id="reserva-group">
          <h3 id="reserva-subtitulo" className="subtitulo">Seleccione cómo desea reservar:</h3>
          <label className="label-radio">
            <input
              type="radio"
              className="input-radio"
              checked={!reservarDiaEspecifico}
              onChange={() => setReservarDiaEspecifico(false)}
            />
            Días en general
          </label>
          <label className="label-radio">
            <input
              type="radio"
              className="input-radio"
              checked={reservarDiaEspecifico}
              onChange={toggleReservarDiaEspecifico}
            />
            Día específico
          </label>
        </div>

        {reservarDiaEspecifico && (
          <>
            <div className="fecha-group">
              <label className="label">Selecciona el Día:</label>
              <div className="datepicker-wrapper">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => {setSelectedDate(date)}}
                  inline
                  minDate={fechaMinima}
                  maxDate={fechaMaxima}
                  filterDate={(date) => date.getDay() !== 0 && date.getDay() !== 6}
                  dateFormat="P"
                  locale="es"
                  required
                  showMonthDropdown={false}
                  showYearDropdown={false}
                  dropdownMode="select"
                />
              </div>
            </div>

            <h3 id="horas-subtitulo" className="subtitulo">Seleccione las horas:</h3>
            <div className="form-group" id="horas-group">
              <label htmlFor="horaDesde" className="label">Desde:</label>
              <select
                id="horaDesde"
                className="select"
                value={formData.dia_esp.horaDesde}
                onChange={(e) => handleHourChange(1, "horaDesde", e.target.value)}
                required
              >
                {horas.slice(0, -1).map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </select>

              <label htmlFor="horaHasta" className="label">Hasta:</label>
              <select
                id="horaHasta"
                className="select"
                value={formData.dia_esp.horaHasta}
                onChange={(e) => handleHourChange(1, "horaHasta", e.target.value)}
              >
                {horaHastaDispDE.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </select>

              <label htmlFor="cancha" className="label">Selecciona la Cancha:</label>
              <select
                id="cancha"
                className="select"
                name="cancha"
                value={formData.dia_esp.cancha}
                onChange={(e) => handleCanchaChange(1, e)}
                required
              >
                <option value="">Selecciona una cancha</option>
                {canchasDisponibles.map((c) => (
                  <option key={c._id} value={c.nombre}>{c.nombre}</option>
                ))}
              </select>

              <label htmlFor="equipo" className="label">Selecciona tu Equipo:</label>
              <select
                id="equipo"
                className="select"
                name="equipo"
                value={formData.dia_esp.equipo}
                onChange={(e) => handleEquipoChange(1, e)}
                required
                disabled={!formData.dia_esp.cancha} 
              >
                <option value="">Selecciona un equipo</option>
                {equipos_Filtrados_DE.map((e) => (
                  <option key={e._id} value={e.nombre}>{e.nombre}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {!reservarDiaEspecifico && (
          <>
            <div className="form-group" id="meses-group">
              <h3 id="meses-subtitulo" className="subtitulo">Seleccione los meses:</h3>
              {mesesDisponibles.map(({ nombre }) => (
                <label className="label-checkbox" key={nombre}>
                  <input
                    type="checkbox"
                    className="input-checkbox"
                    checked={formData.meses[nombre]}
                    onChange={() => handleMonthChange(nombre)}
                  />
                  {nombre}
                </label>
              ))}
            </div>

            <div className="form-group" id="dias-horas-group">
              <h3 id="dias-horas-subtitulo" className="subtitulo">Seleccione los días y horas para cada mes:</h3>
              {Object.keys(formData.dias).map((dia) => (
                <div className="dia-group" key={dia}>
                  <label className="label-checkbox">
                    <input
                      type="checkbox"
                      className="input-checkbox"
                      checked={formData.dias[dia].seleccionado}
                      onChange={() => handleCheckboxChange(dia)}
                    />
                    {dia}
                  </label>

                  {formData.dias[dia].seleccionado && (
                    <div className="form-group" id={`hora-group-${dia}`}>
                      <label htmlFor={`horaDesde-${dia}`} className="label">Desde:</label>
                      <select
                        id={`horaDesde-${dia}`}
                        className="select"
                        value={formData.dias[dia].horaDesde}
                        onChange={(e) => handleHourChange(dia, "horaDesde", e.target.value)}
                      >
                        {horas.slice(0, -1).map((hora) => (
                          <option key={hora} value={hora}>
                            {hora}
                          </option>
                        ))}
                      </select>

                      <label htmlFor={`horaHasta-${dia}`} className="label">Hasta:</label>
                      <select
                        id={`horaHasta-${dia}`}
                        className="select"
                        value={formData.dias[dia].horaHasta}
                        onChange={(e) => handleHourChange(dia, "horaHasta", e.target.value)}
                      >
                        {horasHastaDisponibles(dia).map((hora) => (
                          <option key={hora} value={hora}>
                            {hora}
                          </option>
                        ))}
                      </select>

                      <label htmlFor={`cancha-${dia}`} className="label">Selecciona la Cancha:</label>
                      <select
                        id={`cancha-${dia}`}
                        className="select"
                        name={`cancha-${dia}`}
                        value={formData.dias[dia].cancha}
                        onChange={(e) => handleCanchaChange(dia, e)}
                        required
                      >
                        <option value="">Selecciona una cancha</option>
                        {canchasDisponibles.map((c) => (
                          <option key={c._id} value={c.nombre}>{c.nombre}</option>
                        ))}
                      </select>

                      <label htmlFor={`equipo-${dia}`} className="label">Selecciona tu Equipo:</label>
                      <select
                        id={`equipo-${dia}`}
                        className="select"
                        name={`equipo-${dia}`}
                        value={formData.dias[dia].equipo}
                        onChange={(e) => handleEquipoChange(dia, e)}
                        required
                        disabled={!formData.dias[dia].cancha}
                      >
                        <option value="">Selecciona un equipo</option>
                        {equiposFiltrados[dia].map((e) => (
                          <option key={e._id} value={e.nombre}>{e.nombre}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <button type="submit" className="btn-submit">Enviar Solicitud</button>
      </form>
    </div>
  </div>
)};

export default ReservaEspecial;
