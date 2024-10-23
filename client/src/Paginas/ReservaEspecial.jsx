import React, { useState, useEffect } from "react";
import styled from "styled-components";
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 
import es from 'date-fns/locale/es'; 
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
    archivo: null,
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
      fecha: fechaMinima.toLocaleDateString('en-CA'),
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
      setTimeout(() =>{
        setError('No se encontró el token de autenticación.');
      }, 2000)
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
        setEquiposDisponibles(data.equipos_disponibles)
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
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const nuevafecha = selectedDate.toLocaleDateString('en-CA');

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
    setSelectedFile(null); // Limpiar el archivo seleccionado
    setError(""); // Opcionalmente limpiar el error
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
  
        // Actualiza la hora en caso de que sea diferente de horaDesde
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
        // Verificación para el día específico
        if (tipo === "horaHasta" && convertToMinutes(valor) < convertToMinutes(prevState.dia_esp.horaDesde)) {
          console.log("La hora de 'horaHasta' debe ser mayor o igual a 'horaDesde'");
          return prevState; // Retorna el estado anterior si hay un error
        }
  
        // Lógica para actualizar horaDesde para día específico
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
  
    // Si el valor de la cancha es vacío (deseleccionado), resetea los valores
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
                cancha: '', // Resetea la cancha
                equipo: '', // Resetea el equipo también
              },
            },
          };
        });
        setEquiposFiltrados((prevState) => ({
          ...prevState,
          [dia]: [], // Resetea la lista de equipos
        }));
      } else if (dia === 1) {
        setFormData((prevState) => ({
          ...prevState,
          dia_esp: {
            ...prevState.dia_esp,
            cancha: '', // Resetea la cancha
            equipo: '', // Resetea el equipo también
          },
        }));
        setEquiposFiltrados_DE([]); // Resetea la lista de equipos filtrados
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
    if (!selectedFile) {
      setErrorWithTimeout("Debes cargar un archivo PDF.")
      return;
    };

    if(!reservarDiaEspecifico){
      const mesesSeleccionados = Object.keys(formData.meses).filter(mes => formData.meses[mes]);
      if (mesesSeleccionados.length === 0) {
        setErrorWithTimeout("Debes seleccionar al menos un mes.")
        return;
      };
    
      const diasSeleccionados = Object.keys(formData.dias).filter(dia => formData.dias[dia].seleccionado === true);
      if (diasSeleccionados.length === 0) {
        setErrorWithTimeout("Debes seleccionar al menos un dia en general.")
        return;
      };    
           
      setError(" ")
      console.log(formData.meses);
      console.log(formData.dias);
      
  } else if(reservarDiaEspecifico){
      console.log(formData.dia_esp)
  }
  };

  return (
    <FormularioContainer>
      <h2>Reserva Especial</h2>
      {error && <Error>{error}</Error>}
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="archivo">Subir archivo (PDF):</Label>
          {/* Ocultar el input original */}
          <Input
            type="file"
            id="archivo"
            name="archivo"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: "none" }} // Ocultar el input
          />
          {/* Botón para abrir el diálogo de archivo */}
          <button
            type="button"
            onClick={() => document.getElementById("archivo").click()}
          >
            Seleccionar archivo
          </button>
          {/* Mostrar el nombre del archivo seleccionado */}
          {selectedFile && (
            <div>
              <p>Archivo seleccionado: {selectedFile.name}</p>
              {/* Botón para borrar el archivo seleccionado */}
              <Button  onClick={handleRemoveFile}>
                Borrar archivo
              </Button>
            </div>
          )}
        </FormGroup>
        <FormGroup>
          <h3>Seleccione cómo desea reservar:</h3>
          <LabelRadio>
            <InputRadio
              type="radio"
              checked={!reservarDiaEspecifico}
              onChange={() => setReservarDiaEspecifico(false)}
            />
            Días en general
          </LabelRadio>
          <LabelRadio>
            <InputRadio
              type="radio"
              checked={reservarDiaEspecifico}
              onChange={toggleReservarDiaEspecifico}
            />
            Día específico
          </LabelRadio>
        </FormGroup>

        {reservarDiaEspecifico && (
          <>
            <Fecha>
              <Label>Selecciona el Día:</Label>
              <DatePickerWrapper>
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
              </DatePickerWrapper>
            </Fecha>
            <h3>Seleccione las horas:</h3>
            <FormGroup>
              <Label htmlFor="horaDesde">Desde:</Label>
              <Select
                id="horaDesde"
                value={formData.dia_esp.horaDesde}
                onChange={(e) => handleHourChange(1, "horaDesde", e.target.value)}
                required
              >
                {horas.slice(0, -1).map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </Select>

              <Label htmlFor="horaHasta">Hasta:</Label>
              <Select
                id="horaHasta"
                value={formData.dia_esp.horaHasta}
                onChange={(e) => handleHourChange(1, "horaHasta", e.target.value)}
              >
                {horaHastaDispDE.map((hora) => (
                    <option key={hora} value={hora}>
                      {hora}
                    </option>
                  )) 
                }
              </Select>


              <Label htmlFor="cancha">Selecciona la Cancha:</Label>
              <Select 
                id="cancha"
                name="cancha"
                value={formData.dia_esp.cancha}
                onChange={(e) => handleCanchaChange(1, e)}
                required
              >
                <option value="">Selecciona una cancha</option>
                {canchasDisponibles.map((c) => (
                  <option key={c._id} value={c.nombre}>{c.nombre}</option>
                ))}
              </Select>

              <Label htmlFor="equipo">Selecciona tu Equipo:</Label>
              <Select
                id="equipo"
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
              </Select>
            </FormGroup>
          </>
        )}

        {!reservarDiaEspecifico && (
          <>
            <FormGroup>
              <h3>Seleccione los meses:</h3>
              {mesesDisponibles.map(({ nombre }) => (
                <LabelCheckbox key={nombre}>
                  <InputCheckbox
                    type="checkbox"
                    checked={formData.meses[nombre]}
                    onChange={() => handleMonthChange(nombre)}
                  />
                  {nombre}
                </LabelCheckbox>
              ))}
            </FormGroup>

            <FormGroup>
              <h3>Seleccione los días y horas para cada mes:</h3>
              {Object.keys(formData.dias).map((dia) => (
                <div key={dia}>
                  <LabelCheckbox>
                    <InputCheckbox
                      type="checkbox"
                      checked={formData.dias[dia].seleccionado}
                      onChange={() => handleCheckboxChange(dia)}
                    />
                    {dia}
                  </LabelCheckbox>

                  {formData.dias[dia].seleccionado && (
                    <FormGroup>
                      <Label htmlFor={`horaDesde-${dia}`}>Desde:</Label>
                      <Select
                        id={`horaDesde-${dia}`}
                        value={formData.dias[dia].horaDesde}
                        onChange={(e) => handleHourChange(dia, "horaDesde", e.target.value)}
                      >
                        {horas.slice(0, -1).map((hora) => (
                          <option key={hora} value={hora}>
                            {hora}
                          </option>
                        ))}
                      </Select>

                      <Label htmlFor={`horaHasta-${dia}`}>Hasta:</Label>
                      <Select
                        id={`horaHasta-${dia}`}
                        value={formData.dias[dia].horaHasta}
                        onChange={(e) => handleHourChange(dia, "horaHasta", e.target.value)}
                      >
                        {horasHastaDisponibles(dia).map((hora) => (
                          <option key={hora} value={hora}>
                            {hora}
                          </option>
                        ))}
                      </Select>
                      <Label htmlFor={`Cancha-${dia}`}>Hasta:</Label>
                      <Label htmlFor="cancha">Selecciona la Cancha:</Label>
                      <Select 
                          id={`cancha-${dia}`} 
                          name={`cancha-${dia}`} 
                          value={formData.dias[dia].cancha} // Usa el valor específico del día
                          onChange={(e) => handleCanchaChange(dia, e)} // Pasa el día específico
                          required
                      >
                          <option value="">Selecciona una cancha</option>
                          {canchasDisponibles.map((c) => (
                              <option key={c._id} value={c.nombre}>{c.nombre}</option>
                          ))}
                      </Select>
                      <Label htmlFor="equipo">Selecciona tu Equipo:</Label>
                      <Select
                        id={`equipo-${dia}`}
                        name={`equipo-${dia}`}
                        value={formData.dias[dia].equipo} // Usa el valor específico del día
                        onChange={(e) => handleEquipoChange(dia, e)} // Pasa el día específico
                        disabled={!formData.dias[dia].cancha} // Deshabilitar si no hay cancha seleccionada
                        required
                    >
                        <option value="">Selecciona un equipo</option>
                        {equiposFiltrados[dia].map((e) => (
                            <option key={e._id} value={e.nombre}>{e.nombre}</option>
                        ))}
                    </Select>
                    </FormGroup>
                  )}
                </div>
              ))}
            </FormGroup>
          </>
        )}

        <Button type="submit">Enviar Solicitud</Button>
      </form>
    </FormularioContainer>
  );
}

const FormularioContainer = styled.div`
  max-width: 600px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const DatePickerWrapper = styled.div`
  margin: 10px 0;
`;

const Error = styled.span`
  color: red;
  font-size: 14px;
`;

const LabelCheckbox = styled.label`
  display: flex;
  align-items: center;
`;

const InputCheckbox = styled.input`
  margin-right: 10px;
`;

const LabelRadio = styled.label`
  display: block;
  margin-bottom: 5px;
`;

const InputRadio = styled.input`
  margin-right: 10px;
`;

const Fecha = styled.div`
  margin: 15px 0;
`;

const Button = styled.button`
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

export default ReservaEspecial;
