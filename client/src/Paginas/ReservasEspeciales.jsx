import React, { useEffect, useMemo, useState } from 'react';
import '../Estilos/ReservasEspeciales.css';

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
    if (reservasEspeciales.length > 0) {
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
    }
  }, [reservasEspeciales, reservasFiltradasDGorDE, tipoReserva, mesesOrden, diasOrden]);
  

    return (
<<<<<<< HEAD
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
        <div className="reservas-list">
          {usuariosReservasDG.map((usuario, indexUsuario) => (
            <div key={indexUsuario} className="reserva-item">
              <p><strong>Usuario E-mail:</strong> {usuario}</p>
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
=======
      <div>
        {error && <div className="error">{error}</div>}
        {loading && <p>Cargando reservas...</p>}
        <h2>Reservas Especiales</h2>
        <div>
          <label>
            Tipo de Reserva:
            <select value={tipoReserva} onChange={(e) => setTipoReserva(e.target.value)}>
              <option value="DG">Días en General</option>
              <option value="DE">Días en Específico</option>
            </select>
          </label>
        </div>
    
        {tipoReserva === "DG" ? (
          <div className="reservas-list">
            {usuariosReservasDG.map((usuario, indexUsuario) => (
              <div key={indexUsuario} className="reserva-item">
                <p><strong>Usuario E-mail:</strong> {usuario}</p>
                <p><strong>Fecha envío:</strong> {horaReservaDG[indexUsuario]}</p>
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
                <div>
                  <button onClick={() => manejarPDF(reservasFiltradasDGorDE[indexUsuario]?._id, "descargar")}>Descargar PDF</button>
                  <button onClick={() => manejarPDF(reservasFiltradasDGorDE[indexUsuario]?._id, "ver")}>Ver PDF</button>
                  <button onClick={() => {}}>Aceptar</button>
                  <button onClick={() => {}}>Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="reservas-list">
            {usuariosReservasDE.map((usuario, indexUsuario) => (
              <div key={indexUsuario} className="reserva-item">
                <p><strong>Usuario E-mail:</strong> {usuario}</p>
                <p><strong>Fecha envío:</strong> {horaReservaDE[indexUsuario]}</p>
                <p><strong>Fecha:</strong> {DEfechasReservadas[indexUsuario]}</p>
                <p><strong>Hora Desde:</strong> {DEhorasDesdeReservadas[indexUsuario]}</p>
                <p><strong>Hora Hasta:</strong> {DEhorasHastaReservadas[indexUsuario]}</p>
                <p><strong>Cancha:</strong> {DEcanchasReservadas[indexUsuario]}</p>
                <p><strong>Equipo:</strong> {DEequiposReservados[indexUsuario]}</p>
>>>>>>> 845cc6460fd5f2a0ff7a490d4bef71a31dc9a452
                <button onClick={() => manejarPDF(reservasFiltradasDGorDE[indexUsuario]?._id, "descargar")}>Descargar PDF</button>
                <button onClick={() => manejarPDF(reservasFiltradasDGorDE[indexUsuario]?._id, "ver")}>Ver PDF</button>
                <button onClick={() => {}}>Aceptar</button>
                <button onClick={() => {}}>Rechazar</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="reservas-list">
          {usuariosReservasDE.map((usuario, indexUsuario) => (
            <div key={indexUsuario} className="reserva-item">
              <p><strong>Usuario E-mail:</strong> {usuario}</p>
              <p><strong>Fecha:</strong> {DEfechasReservadas[indexUsuario]}</p>
              <p><strong>Hora Desde:</strong> {DEhorasDesdeReservadas[indexUsuario]}</p>
              <p><strong>Hora Hasta:</strong> {DEhorasHastaReservadas[indexUsuario]}</p>
              <p><strong>Cancha:</strong> {DEcanchasReservadas[indexUsuario]}</p>
              <p><strong>Equipo:</strong> {DEequiposReservados[indexUsuario]}</p>
              <div className="button-group">
                <button onClick={() => manejarPDF(reservasFiltradasDGorDE[indexUsuario]?._id, "descargar")}>Descargar PDF</button>
                <button onClick={() => manejarPDF(reservasFiltradasDGorDE[indexUsuario]?._id, "ver")}>Ver PDF</button>
                <button onClick={() => {}}>Aceptar</button>
                <button onClick={() => {}}>Rechazar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReservasEspeciales;