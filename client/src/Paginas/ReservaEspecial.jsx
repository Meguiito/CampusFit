import React, { useState, useEffect } from "react";
import styled from "styled-components";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 

function ReservaEspecial() {

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
  const [selectedDate, setSelectedDate] = useState(fechaMinima);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [mesesDisponibles, setMesesDisponibles] = useState([]);
  const [diaActual] = useState(new Date());
  const [reservarDiaEspecifico, setReservarDiaEspecifico] = useState(false);
  const [maxDate, setMaxDate] = useState(new Date());
  const [cancha, setCancha] = useState('');
  const [canchaTipo, setCanchaTipo] = useState('');
  const [equipo, setEquipo] = useState('');
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
      fecha: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      horaDesde: "08:00",
      horaHasta: "10:00",
      cancha: cancha,
      equipo: equipo,
    }
  });

  const [equiposFiltrados, setEquiposFiltrados] = useState({
    Lunes: [],
    Martes: [],
    Miércoles: [],
    Jueves: [],
    Viernes: [],
  }); 

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
        setCanchasDisponibles(data.canchas_disponibles);
        setEquiposDisponibles(data.equipos_disponibles)
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al obtener los datos.');
      }
    } catch (error) {
      console.error('Error de red:', error);
      setError('Error al conectar con el servidor.');
    }
  };

  useEffect(() => {
    fetchCanchasYEquipos();
  }, []);

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

    // Calcular la fecha máxima
    const finalSemestre = semestreActual === 1 
      ? new Date(diaActual.getFullYear(), 6, 0) // Último día de Junio
      : new Date(diaActual.getFullYear(), 12, 0); // Último día de Diciembre

    setMaxDate(finalSemestre);
  }, [diaActual]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);  
      } else {
        setError('Por favor, selecciona un archivo PDF.'); 
      }
    }
  };
  
  const convertToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleHourChange = (dia, tipo, valor) => {
    setFormData((prevState) => {
      if(!reservarDiaEspecifico){
        if (tipo === "horaHasta" && convertToMinutes(valor) < convertToMinutes(prevState.dias[dia].horaDesde)) {
          console.log("La hora de 'horaHasta' debe ser mayor o igual a 'horaDesde'");
          return prevState;
        }

        if (tipo === "horaDesde") {
          const nuevaHoraHasta = convertToMinutes(prevState.dias[dia].horaHasta) <= convertToMinutes(valor)
            ? horas.find(hora => convertToMinutes(hora) > convertToMinutes(valor))
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
                horaHasta: nuevaHoraHasta
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
      } else{
        if (tipo === "horaHasta" && convertToMinutes(valor) < convertToMinutes(prevState.dia_esp.horaDesde)) {
          console.log("La hora de 'horaHasta' debe ser mayor o igual a 'horaDesde'");
          return prevState;
        }
        if (tipo === "horaDesde") {
          const nuevaHoraHasta = convertToMinutes(prevState.dia_esp.horaHasta) <= convertToMinutes(valor)
          ? horas.find(hora => convertToMinutes(hora) > convertToMinutes(valor))
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
    });
  };

  const horasHastaDisponibles = (dia) => horas.filter(hora => convertToMinutes(hora) > convertToMinutes(horaDesdeSeleccionada[dia]));


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

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(formData.dias);

    if(!reservarDiaEspecifico){
      const mesesSeleccionados = Object.keys(formData.meses).filter(mes => formData.meses[mes]);
      if (mesesSeleccionados.length === 0) {
        setError("Debes seleccionar al menos un mes.");
        return;
      };
    
      const diasSeleccionados = Object.keys(formData.dias).filter(dia => formData.dias[dia].seleccionado === true);
      if (diasSeleccionados.length === 0) {
        setError("Debes seleccionar al menos un dia en general.");
        return;
      };    
      if (!formData.pdf) {
        setError("Debes cargar un archivo PDF.");
        return;
      };
      
      setError(" ")
      const reservas = crearReservas_DG(mesesSeleccionados);
      console.log(formData);
      console.log(reservas);
  } else{

  }
  };

  const crearReservas_DG = (meses) => {
  };

  
  const generarIdUnico = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  

  const handleCanchaChange = (dia, e) => { 
    const canchaNombre = e.target.value;
    const canchaSeleccionada = canchasDisponibles.find(c => c.nombre === canchaNombre);
  
    if (!canchaSeleccionada) {
      console.log("Cancha no encontrada");
      return;
    }
    
    if(!reservarDiaEspecifico){
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
      })
     } else {
         setCancha(canchaNombre);
     };
  
    const equiposFiltradosParaDia = equiposDisponibles.filter(e => e.tipo === canchaSeleccionada.tipo);
    setEquiposFiltrados((prevState) => ({
      ...prevState,
      [dia]: equiposFiltradosParaDia 
    }));
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
       } else{
            setEquipo(equipoSeleccionado);
         }
    });
};

  
  return (
    <FormularioContainer>
      <h2>Reserva Especial</h2>
      {error && <Error>{error}</Error>}
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="archivo">Subir archivo (PDF):</Label>
          <Input
            type="file"
            id="archivo"
            name="archivo"
            accept=".pdf"
            onChange={handleFileChange}
          />
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
                  onChange={(date) => {setSelectedDate(date);}}
                  inline
                  minDate={fechaMinima}
                  maxDate={fechaMaxima}
                  filterDate={(date) => date.getDay() !== 0 && date.getDay() !== 6}
                  dateFormat="P"
                  locale="es"
                  required
                />
              </DatePickerWrapper>
            </Fecha>
            <h3>Seleccione las horas:</h3>
            <FormGroup>
              <Label htmlFor="horaDesde">Desde:</Label>
              <Select
                id="horaDesde"
                value={formData.dias[selectedDate ? selectedDate.toLocaleDateString() : "Lunes"]?.horaDesde || ''} // Usar el día seleccionado
                onChange={(e) => handleHourChange(selectedDate.toLocaleDateString(), "horaDesde", e.target.value)}
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
                value={formData.dias[selectedDate ? selectedDate.toLocaleDateString() : "Lunes"]?.horaHasta || ''}
                onChange={(e) => handleHourChange(selectedDate.toLocaleDateString(), "horaHasta", e.target.value)}
              >
                {horasHastaDisponibles[selectedDate.toLocaleDateString()].map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </Select>

              <Label htmlFor="cancha">Selecciona la Cancha:</Label>
              <Select 
                id="cancha"
                name="cancha"
                value={cancha}
                onChange={(e) => handleCanchaChange(e)}
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
                value={equipo}
                onChange={(e) => setEquipo(e.target.value)}
                required
                disabled={!canchaTipo} 
              >
                <option value="">Selecciona un equipo</option>
                {equiposFiltrados.map((e) => (
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
