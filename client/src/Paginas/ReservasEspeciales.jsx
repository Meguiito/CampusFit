import React, { useEffect, useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, addDays } from 'date-fns';
import '../Estilos/ReservasEspeciales.css';
import { toZonedTime } from 'date-fns-tz';
const zonaChile = 'America/Santiago';

function ReservasEspeciales() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reservasEspeciales, setReservasEspeciales] = useState([]);
  const [reservasFiltradasDGorDE, setReservasFiltradasDGorDE] = useState([]);
  const [usuariosReservasDG, setusuariosReservasDG] = useState([]);
  const [horaReservaDG, sethoraReservaDG] = useState([])
  const [mesesReservados, setMesesReservados] = useState([]);
  const [diasReservados, setDiasReservados] = useState([]);
  const [horasDesdeReservadas, setHorasDesdeReservadas] = useState([]);
  const [horasHastaReservadas, setHorasHastaReservadas] = useState([]);
  const [canchasReservadas, setCanchasReservadas] = useState([]);
  const [equiposReservados, setEquiposReservados] = useState([]);
  const [usuariosReservasDE, setusuariosReservasDE] = useState([]);
  const [horaReservaDE, sethoraReservaDE] = useState([])
  const [DEfechasReservadas, setDEfechasReservadas] = useState([]);
  const [DEhorasDesdeReservadas, setDEhorasDesdeReservadas] = useState([]);
  const [DEhorasHastaReservadas, setDEhorasHastaReservadas] = useState([]);
  const [DEcanchasReservadas, setDEcanchasReservadas] = useState([]);
  const [DEequiposReservados, setDEequiposReservados] = useState([]);
  const [tipoReserva, setTipoReserva] = useState("DG");

  const setErrorWithTimeout = (message) => {
    setError(message);
    setTimeout(() => setError(""), 2000);
  };
  useEffect(() => {
    const fetchReservasEspeciales = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchReservasEspeciales();
  }, []);


  const manejarPDF = async (reservaId, tipo) => {
    const reserva = reservasEspeciales.find(reserva => reserva._id === reservaId);
    console.log(reserva);
    
    if (reserva && reserva.file_id) {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setErrorWithTimeout('No se encontró el token de autenticación.');
        return;
      }
      
      try {
        const response = await fetch(`http://localhost:5000/manejar_pdf/${reserva._id}/${tipo}`, { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, 
          },
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          setErrorWithTimeout(errorData.error || 'Error al obtener el PDF.');
          return;
        }
  
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        if (tipo === 'descargar') {
          const a = document.createElement('a');
          a.href = url;
          a.download = reserva.filename || 'archivo.pdf';
          a.click();
          window.URL.revokeObjectURL(url);
        } else if (tipo === 'ver') {
            window.open(url, '_blank');
        }
  
      } catch (error) {
        console.error('Error al obtener el PDF:', error);
        setErrorWithTimeout('Error al conectar con el servidor al intentar obtener el PDF.');
      }
    } else {
      setErrorWithTimeout('PDF no disponible.');
    }
  };
  
  const mesesOrden = useMemo(() => ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"], []);
  const diasOrden = useMemo(() => ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"], []);

  useEffect(() => {
    const reservasFiltradas = reservasEspeciales.filter(reserva => reserva.tipo === tipoReserva);
    setReservasFiltradasDGorDE(reservasFiltradas);

    if (tipoReserva === "DG") {

      const usuariosActualizados = reservasFiltradas.map(reserva => reserva.user_email);
      setusuariosReservasDG(usuariosActualizados);    

      const horasDGActualizadas = reservasFiltradas.map(reserva => reserva.upload_date);
      sethoraReservaDG(horasDGActualizadas);   

      const mesesReservadosActualizados = reservasFiltradas.map(reserva => 
        Object.keys(reserva.meses)
          .filter(mes => reserva.meses[mes])
          .sort((a, b) => mesesOrden.indexOf(a.toLowerCase()) - mesesOrden.indexOf(b.toLowerCase()))
      );
      setMesesReservados(mesesReservadosActualizados);

      const diasReservadosActualizados = reservasFiltradas.map(reserva => 
        Object.keys(reserva.dias)
          .filter(dia => reserva.dias[dia].seleccionado)
          .sort((a, b) => diasOrden.indexOf(a.toLowerCase()) - diasOrden.indexOf(b.toLowerCase()))
      );
      setDiasReservados(diasReservadosActualizados);

      const horaDesdeActualizados = reservasFiltradas.map(reserva => 
        Object.keys(reserva.dias)
          .filter(dia => reserva.dias[dia].seleccionado)
          .sort((a, b) => diasOrden.indexOf(a.toLowerCase()) - diasOrden.indexOf(b.toLowerCase()))
          .map(dia => reserva.dias[dia].horaDesde)
      );
      setHorasDesdeReservadas(horaDesdeActualizados);

      const horaHastaActualizados = reservasFiltradas.map(reserva => 
        Object.keys(reserva.dias)
          .filter(dia => reserva.dias[dia].seleccionado)
          .sort((a, b) => diasOrden.indexOf(a.toLowerCase()) - diasOrden.indexOf(b.toLowerCase()))
          .map(dia => reserva.dias[dia].horaHasta)
      );
      setHorasHastaReservadas(horaHastaActualizados);

      const canchasActualizadas = reservasFiltradas.map(reserva => 
        Object.keys(reserva.dias)
          .filter(dia => reserva.dias[dia].seleccionado)
          .sort((a, b) => diasOrden.indexOf(a.toLowerCase()) - diasOrden.indexOf(b.toLowerCase()))
          .map(dia => reserva.dias[dia].cancha)
      );
      setCanchasReservadas(canchasActualizadas);

      const equiposActualizados = reservasFiltradas.map(reserva => 
        Object.keys(reserva.dias)
          .filter(dia => reserva.dias[dia].seleccionado)
          .sort((a, b) => diasOrden.indexOf(a.toLowerCase()) - diasOrden.indexOf(b.toLowerCase()))
          .map(dia => reserva.dias[dia].equipo)
      );
      setEquiposReservados(equiposActualizados);
    } else {

      const uDEActualizados = reservasFiltradas.map(reserva => reserva.user_email);
      setusuariosReservasDE(uDEActualizados);    

      const horasDEActualizadas = reservasFiltradas.map(reserva => reserva.upload_date);
      sethoraReservaDE(horasDEActualizadas);

      const fechasActualizadas = reservasFiltradas.map(reserva => reserva.dia_esp.fecha);
      setDEfechasReservadas(fechasActualizadas);

      const hdDEActualizadas = reservasFiltradas.map(reserva => reserva.dia_esp.horaDesde);
      setDEhorasDesdeReservadas(hdDEActualizadas);

      const hhDEActualizadas = reservasFiltradas.map(reserva => reserva.dia_esp.horaHasta);
      setDEhorasHastaReservadas(hhDEActualizadas);

      const cDEActualizadas = reservasFiltradas.map(reserva => reserva.dia_esp.cancha);
      setDEcanchasReservadas(cDEActualizadas);

      const eDEActualizadas = reservasFiltradas.map(reserva => reserva.dia_esp.equipo);
      setDEequiposReservados(eDEActualizadas);
    }
  }, [reservasEspeciales, tipoReserva, mesesOrden, diasOrden]);

  
  const obtenerFechasParaDiaSemana = (mes, año, dia, fechaActual) => {

    const mesNumero = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
      .indexOf(mes.toLowerCase()) + 1;  
  
    // Obtener el número del día de la semana
    const diaNumero = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
      .indexOf(dia.toLowerCase());  
  
    // Verificar si los parámetros son válidos
    if (mesNumero === 0 || diaNumero === -1) {
      return [];  
    }
  
    // Obtener la fecha de inicio y fin del mes
    const inicioMes = startOfMonth(new Date(año, mesNumero - 1)); 
    const finMes = endOfMonth(new Date(año, mesNumero - 1)); 
  
    // Asegurarse de que 'fechaActual' esté en la zona horaria de Chile
    if (!(fechaActual instanceof Date)) {
      console.error("fechaActual debe ser una instancia de Date.");
      return [];
    }
  
    // Convertir la fecha actual a la zona horaria de Chile
    const fechaActualEnChile = toZonedTime(fechaActual, zonaChile);
  
    let fecha = inicioMes;
    const fechas = [];
  
    // Iterar sobre el mes y obtener las fechas que corresponden al día de la semana solicitado
    while (fecha <= finMes) {
      // Verificar si la fecha es el día de la semana solicitado y es mayor o igual a la fecha actual
      if (fecha.getDay() === diaNumero && fecha >= fechaActualEnChile) {
        // Convertir la fecha a la zona horaria de Chile antes de formatear
        const fechaZonificada = toZonedTime(fecha, zonaChile);
        fechas.push(format(fechaZonificada, "dd-MM-yyyy"));
      }
      fecha = addDays(fecha, 1);  // Avanzar al siguiente día
    }
  
    return fechas;  
  };


  const aceptarReserva = async (reservaId, id) => {
    const reserva = reservasEspeciales.find(reserva => reserva._id === reservaId);

    if (!reserva) {
      setErrorWithTimeout('No se encontró la reserva.');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorWithTimeout('No se encontró el token de autenticación.');
      return;
    }
  
    try {
      const documentos = [];
      const añoActual = new Date().getFullYear();
      const fechaActual = new Date();
      if (tipoReserva === "DG") {
        mesesReservados[id].forEach((mes) => {
          diasReservados[id].forEach((dia, index_dia) => {
            const fechas = obtenerFechasParaDiaSemana(mes, añoActual, dia, fechaActual);
            const horaInicio = parseInt(horasDesdeReservadas[id][index_dia].split(':')[0]);
            const horaFin = parseInt(horasHastaReservadas[id][index_dia].split(':')[0]);
            fechas.forEach((fecha) => {
              for (let hora = horaInicio; hora < horaFin; hora += 2) {
                documentos.push({
                  fecha: fecha,
                  hora: `${hora.toString().padStart(2, '0')}:00`,
                  cancha: canchasReservadas[id][index_dia],
                  equipo: equiposReservados[id][index_dia],
                  id_reserva_especial: reserva._id,
                  email_usuario_reserva_especial: reserva.user_email
                });
              }
            });
          });
        });

      } else if (tipoReserva === "DE") {

        const horaInicio = parseInt(DEhorasDesdeReservadas[id].split(':')[0]);
        const horaFin = parseInt(DEhorasHastaReservadas[id].split(':')[0]);
  
        for (let hora = horaInicio; hora < horaFin; hora += 2) {
          documentos.push({
            fecha: DEfechasReservadas[id],
            hora: `${hora.toString().padStart(2, '0')}:00`,
            cancha: DEcanchasReservadas[id],
            equipo: DEequiposReservados[id],
            id_reserva_especial: reserva._id,
            email_usuario_reserva_especial: reserva.user_email
          });
        }
      }
      
      const response = await fetch('http://localhost:5000/aceptar_reserva_especial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ documentos }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setErrorWithTimeout(errorData.error || 'Error al aceptar la reserva.');
      } else {
        setReservasEspeciales(prev => prev.filter(r => r._id !== reservaId));
      
        try {
          const response_2 = await fetch('http://localhost:5000/copia_reserva_especial_aceptada', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(reserva),
          });
      
          if (!response_2.ok) {
            const errorData = await response_2.json();
            setErrorWithTimeout(errorData.error || 'Error al guardar la copia de la reserva.');
          } else {
            console.log('Reserva aceptada y copia creada exitosamente.');
          }
        } catch (error) {
          console.error('Error al guardar la copia de la reserva:', error);
          setErrorWithTimeout('Error al conectar con el servidor para guardar la copia.');
        }
      }  
    } catch (error) {
      console.error('Error al aceptar la reserva:', error);
      setErrorWithTimeout('Error al conectar con el servidor para aceptar la reserva.');
    }
  };
  

  const rechazarReserva = async (reservaId) => {
    const reserva = reservasEspeciales.find(reserva => reserva._id === reservaId);
  
    if (!reserva) {
      setErrorWithTimeout('No se encontró la reserva.');
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorWithTimeout('No se encontró el token de autenticación.');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/copia_reserva_especial_rechazada', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(reserva),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setErrorWithTimeout(errorData.error || 'Error al rechazar la reserva.');
      } else {
        console.log('Reserva rechazada y registrada exitosamente.');
        setReservasEspeciales(prev => prev.filter(r => r._id !== reservaId)); 
      }
    } catch (error) {
      console.error('Error al rechazar la reserva:', error);
      setErrorWithTimeout('Error al conectar con el servidor para rechazar la reserva.');
    }
  };
  

  return (
    <div className="reservas-especiales-container">
      {error && <div className="error">{error}</div>}
      {loading && <p className="loading-text">Cargando reservas...</p>}
  
      <h2 className="title-reservas">Reservas Especiales</h2>
      <div className="tipo-reserva">
        <label>
          Tipo de Reserva:
          <select value={tipoReserva} onChange={(e) => setTipoReserva(e.target.value)}>
            <option value="DG">Días en General</option>
            <option value="DE">Días en Específico</option>
          </select>
        </label>
      </div>
  
      {tipoReserva === "DG" ? (
        reservasFiltradasDGorDE.length > 0 ? (
          <div className="reservas-list">
            {usuariosReservasDG.map((usuario, indexUsuario) => (
              <div key={indexUsuario} className="reserva-item">
                <p><strong>Usuario E-mail:</strong> {usuario}</p>
                <p><strong>Fecha de Envio:</strong> {horaReservaDG[indexUsuario]}</p>
                <p><strong>Mes:</strong> {mesesReservados[indexUsuario].join(', ')}</p>
                {diasReservados[indexUsuario]?.map((dia, indexDia) => (
                  <div key={indexDia} className="dia-item">
                    <p><strong>Día:</strong> {dia}</p>
                    <p><strong>Hora Desde:</strong> {horasDesdeReservadas[indexUsuario]?.[indexDia]}</p>
                    <p><strong>Hora Hasta:</strong> {horasHastaReservadas[indexUsuario]?.[indexDia]}</p>
                    <p><strong>Cancha:</strong> {canchasReservadas[indexUsuario]?.[indexDia]}</p>
                    <p><strong>Equipo:</strong> {equiposReservados[indexUsuario]?.[indexDia]}</p>
                  </div>
                ))}
                <div className="button-group">
                  <button onClick={() => manejarPDF(reservasFiltradasDGorDE[indexUsuario]?._id, "descargar")}>Descargar PDF</button>
                  <button onClick={() => manejarPDF(reservasFiltradasDGorDE[indexUsuario]?._id, "ver")}>Ver PDF</button>
                  <button onClick={() => aceptarReserva(reservasFiltradasDGorDE[indexUsuario]?._id, indexUsuario)}>Aceptar</button>
                  <button onClick={() => rechazarReserva(reservasFiltradasDGorDE[indexUsuario]?._id)}>Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay solicitudes de reservas especiales de tipo Días en General.</p>
        )
      ) : (
        reservasFiltradasDGorDE.length > 0 ? (
          <div className="reservas-list">
            {usuariosReservasDE.map((usuario, indexUsuario) => (
              <div key={indexUsuario} className="reserva-item">
                <p><strong>Usuario E-mail:</strong> {usuario}</p>
                <p><strong>Fecha de Envio:</strong> {horaReservaDE[indexUsuario]}</p>
                <p><strong>Fecha de Reserva:</strong> {DEfechasReservadas[indexUsuario]}</p>
                <p><strong>Hora Desde:</strong> {DEhorasDesdeReservadas[indexUsuario]}</p>
                <p><strong>Hora Hasta:</strong> {DEhorasHastaReservadas[indexUsuario]}</p>
                <p><strong>Cancha:</strong> {DEcanchasReservadas[indexUsuario]}</p>
                <p><strong>Equipo:</strong> {DEequiposReservados[indexUsuario]}</p>
                <div className="button-group">
                  <button onClick={() => manejarPDF(reservasFiltradasDGorDE[indexUsuario]?._id, "descargar")}>Descargar PDF</button>
                  <button onClick={() => manejarPDF(reservasFiltradasDGorDE[indexUsuario]?._id, "ver")}>Ver PDF</button>
                  <button onClick={() => aceptarReserva(reservasFiltradasDGorDE[indexUsuario]?._id, indexUsuario)}>Aceptar</button>
                  <button onClick={() => rechazarReserva(reservasFiltradasDGorDE[indexUsuario]?._id)}>Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay solicitudes de reservas especiales de tipo Días en Específico.</p>
        )
      )}
    </div>
  );
}

export default ReservasEspeciales;