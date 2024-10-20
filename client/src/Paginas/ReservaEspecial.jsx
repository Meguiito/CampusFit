import React, { useState, useEffect } from "react";
import styled from "styled-components";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import es from 'date-fns/locale/es'; 

function ReservaEspecial() {
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
      Lunes: { horaDesde: "08:00", horaHasta: "10:00", seleccionado: false },
      Martes: { horaDesde: "08:00", horaHasta: "10:00", seleccionado: false },
      Miércoles: { horaDesde: "08:00", horaHasta: "10:00", seleccionado: false },
      Jueves: { horaDesde: "08:00", horaHasta: "10:00", seleccionado: false },
      Viernes: { horaDesde: "08:00", horaHasta: "10:00", seleccionado: false },
    },
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [mesesDisponibles, setMesesDisponibles] = useState([]);
  const [diaActual] = useState(new Date());
  const [reservarDiaEspecifico, setReservarDiaEspecifico] = useState(false);
  const [maxDate, setMaxDate] = useState(new Date());
  const [horaDesdeSeleccionada, setHoraDesdeSeleccionada] = useState("10:00"); // Estado para la hora "desde"

  const horas = [];
  for (let h = 8; h <= 20; h += 2) {
    const hour = h < 10 ? `0${h}:00` : `${h}:00`;
    horas.push(hour);
  }

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setError("");
  };
  const convertToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleHourChange = (dia, tipo, valor) => {
    setFormData((prevState) => {
      const newHoras = {
        ...prevState.dias[dia],
        [tipo]: valor,
      };

      // Validar que horaHasta sea mayor que horaDesde
      if (tipo === "horaHasta" && convertToMinutes(newHoras.horaHasta) <= convertToMinutes(newHoras.horaDesde)) {
        return prevState; // No se actualiza si la validación falla
      }

      return {
        ...prevState,
        dias: {
          ...prevState.dias,
          [dia]: newHoras,
        },
      };
    });

    // Actualizar el estado de la hora desde seleccionada
    if (tipo === "horaDesde") {
      setHoraDesdeSeleccionada(valor);
    }
  };

  // Filtrar horas "hasta" disponibles según la hora "desde" seleccionada
  const horasHastaDisponibles = horas.filter(hora => convertToMinutes(hora) > convertToMinutes(horaDesdeSeleccionada));


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
    setError(null);

    const token = localStorage.getItem('token');
    const fecha = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
    const bloquesDeHoras = Object.keys(formData.dias)
      .filter(dia => formData.dias[dia].seleccionado)
      .map(dia => ({
        dia,
        horaDesde: formData.dias[dia].horaDesde,
        horaHasta: formData.dias[dia].horaHasta,
      }));

    const solicitudReservas = {
      fecha,
      bloquesDeHoras,
      meses: formData.meses,
      estado: 'Pendiente',
    };

    const data = new FormData();
    data.append('solicitudReservas', JSON.stringify(solicitudReservas));
    if (selectedFile) {
      data.append('file', selectedFile);
    }

    try {
      const response = await fetch('http://localhost:5000/special_request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });

      if (response.ok) {
        alert("Tu solicitud ha sido enviada para su revisión.");
      } else {
        const result = await response.json();
        setError(result.error || 'Error al enviar la solicitud.');
      }
    } catch (error) {
      setError('Error al conectar con el servidor.');
    }
  };

  return (
    <FormularioContainer>
      <h2>Reserva Especial</h2>
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
          {error && <Error>{error}</Error>}
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
                  onChange={(date) => setSelectedDate(date)}
                  inline
                  minDate={diaActual}
                  maxDate={maxDate}
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
                value={formData.dias.Lunes.horaDesde} // Usar Lunes como referencia ya que es solo un día
                onChange={(e) => handleHourChange("Lunes", "horaDesde", e.target.value)}
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
                value={formData.dias.Lunes.horaHasta}
                onChange={(e) => handleHourChange("Lunes", "horaHasta", e.target.value)}
              >
                {horasHastaDisponibles.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
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
                        {horasHastaDisponibles.map((hora) => (
                          <option key={hora} value={hora}>
                            {hora}
                          </option>
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
