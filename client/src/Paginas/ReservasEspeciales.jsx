import React, { useEffect, useMemo, useState, useRef } from 'react';
import { format, startOfMonth, endOfMonth, addDays } from 'date-fns';
import '../Estilos/ReservasEspeciales.css';
import { toZonedTime } from 'date-fns-tz';
const zonaChile = 'America/Santiago';

function ReservasEspeciales() {
  const errorRef = useRef(null); 
  const [llamada, setLlamada] = useState(false);
  const [loading, setLoading] = useState(false);
  const [res_load, setRes_load] = useState(false);
  const [msjres_load, setMsjes_load] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);  
  const [currentAction, setCurrentAction] = useState(null);  
  const [reservaIdToConfirm, setReservaIdToConfirm] = useState(null); 
  const [reservaIndex, setReservaIndex] = useState(null); 
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); 
  const [modalMessage, setModalMessage] = useState("");
  const [error, setError] = useState("");
  const [reservasEspeciales, setReservasEspeciales] = useState([]);
  const [reservasEspecialesRA, setReservasEspecialesRA] = useState([]);
  const [reservasEspecialesRR, setReservasEspecialesRR] = useState([]);
  const [reservasFiltradasDGorDE, setReservasFiltradasDGorDE] = useState([]);
  const [reservasFiltradasRA, setReservasFiltradasRA] = useState([]);
  const [reservasFiltradasRR, setReservasFiltradasRR] = useState([]);
  const [usuariosReservasDG, setusuariosReservasDG] = useState([]);
  const [usuariosReservasDGRA, setusuariosReservasDGRA] = useState([]);
  const [usuariosReservasDGRR, setusuariosReservasDGRR] = useState([]);
  const [horaReservaDG, sethoraReservaDG] = useState([])
  const [horaReservaDGRA, sethoraReservaDGRA] = useState([])
  const [horaReservaDGRR, sethoraReservaDGRR] = useState([])
  const [mesesReservados, setMesesReservados] = useState([]);
  const [mesesReservadosRA, setMesesReservadosRA] = useState([]);
  const [mesesReservadosRR, setMesesReservadosRR] = useState([]);
  const [diasReservados, setDiasReservados] = useState([]);
  const [diasReservadosRA, setDiasReservadosRA] = useState([]);
  const [diasReservadosRR, setDiasReservadosRR] = useState([]);
  const [horasDesdeReservadas, setHorasDesdeReservadas] = useState([]);
  const [horasDesdeReservadasRA, setHorasDesdeReservadasRA] = useState([]);
  const [horasDesdeReservadasRR, setHorasDesdeReservadasRR] = useState([]);
  const [horasHastaReservadas, setHorasHastaReservadas] = useState([]);
  const [horasHastaReservadasRA, setHorasHastaReservadasRA] = useState([]);
  const [horasHastaReservadasRR, setHorasHastaReservadasRR] = useState([]);
  const [canchasReservadas, setCanchasReservadas] = useState([]);
  const [canchasReservadasRA, setCanchasReservadasRA] = useState([]);
  const [canchasReservadasRR, setCanchasReservadasRR] = useState([]);
  const [equiposReservados, setEquiposReservados] = useState([]);
  const [equiposReservadosRA, setEquiposReservadosRA] = useState([]);
  const [equiposReservadosRR, setEquiposReservadosRR] = useState([]);
  const [usuariosReservasDE, setusuariosReservasDE] = useState([]);
  const [usuariosReservasRADE, setusuariosReservasRADE] = useState([]);
  const [usuariosReservasRRDE, setusuariosReservasRRDE] = useState([]);
  const [horaReservaDE, sethoraReservaDE] = useState([]);
  const [horaReservaRADE, sethoraReservaRADE] = useState([])
  const [horaReservaRRDE, sethoraReservaRRDE] = useState([])
  const [DEfechasReservadas, setDEfechasReservadas] = useState([]);
  const [DEfechasReservadasRA, setDEfechasReservadasRA] = useState([]);
  const [DEfechasReservadasRR, setDEfechasReservadasRR] = useState([]);
  const [DEhorasDesdeReservadas, setDEhorasDesdeReservadas] = useState([]);
  const [DEhorasDesdeReservadasRA, setDEhorasDesdeReservadasRA] = useState([]);
  const [DEhorasDesdeReservadasRR, setDEhorasDesdeReservadasRR] = useState([]);
  const [DEhorasHastaReservadas, setDEhorasHastaReservadas] = useState([]);
  const [DEhorasHastaReservadasRA, setDEhorasHastaReservadasRA] = useState([]);
  const [DEhorasHastaReservadasRR, setDEhorasHastaReservadasRR] = useState([]);
  const [DEcanchasReservadas, setDEcanchasReservadas] = useState([]);
  const [DEcanchasReservadasRA, setDEcanchasReservadasRA] = useState([]);
  const [DEcanchasReservadasRR, setDEcanchasReservadasRR] = useState([]);
  const [DEequiposReservados, setDEequiposReservados] = useState([]);
  const [DEequiposReservadosRA, setDEequiposReservadosRA] = useState([]);
  const [DEequiposReservadosRR, setDEequiposReservadosRR] = useState([]);
  const [tipoReserva, setTipoReserva] = useState("DG");
  const [tipoReservaRARR, setTipoReservaRARR] = useState("DG");

  const setErrorWithTimeout = (message) => {
    setError(message);
    setTimeout(() => setError(""), 5000);
  };

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]); 

  useEffect(() => {
    const fetchReservas = async (url, setData, errorMessage) => {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorWithTimeout('No se encontró el token de autenticación.');
        return;
      }
  
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setData(data);
        } else {
          const errorData = await response.json();
          setErrorWithTimeout(errorData.error || errorMessage);
        }
      } catch (error) {
        console.error('Error de red:', error);
        setErrorWithTimeout('Error al conectar con el servidor.');
      }
    };
  
    const fetchAllReservas = async () => {
      setLoading(true); 
  
      const endpoints = [
        {
          url: 'http://localhost:5000/get_special_requests',
          setData: setReservasEspeciales,
          errorMessage: 'Error al obtener las reservas especiales.',
        },
        {
          url: 'http://localhost:5000/obtener_reservas_especiales_aceptadas',
          setData: setReservasEspecialesRA,
          errorMessage: 'Error al obtener las reservas especiales aceptadas.',
        },
        {
          url: 'http://localhost:5000/obtener_reservas_especiales_rechazadas',
          setData: setReservasEspecialesRR,
          errorMessage: 'Error al obtener las reservas especiales rechazadas.',
        },
      ];
  
      await Promise.all(
        endpoints.map(endpoint => fetchReservas(endpoint.url, endpoint.setData, endpoint.errorMessage))
      );
  
      setLoading(false); 
    };
  
    fetchAllReservas();
  }, [llamada]);
  


  const manejarPDF = async (reservaId, tipo) => {
    let reserva = reservasEspeciales.find(reserva => reserva._id === reservaId);

    if (!reserva) {
      reserva = reservasEspecialesRA.find(reserva => reserva._id === reservaId);
    }
    
    if (!reserva) {
      reserva = reservasEspecialesRR.find(reserva => reserva._id === reservaId);
    }
    
    
    console.log(reserva, reservaId);
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


  useEffect(() => {
    const reservasFiltradas = reservasEspecialesRA.filter(reserva => reserva.tipo === tipoReservaRARR);
    setReservasFiltradasRA(reservasFiltradas);

    if (tipoReservaRARR === "DG") {

      const usuariosActualizados = reservasFiltradas.map(reserva => reserva.user_email);
      setusuariosReservasDGRA(usuariosActualizados);    

      const horasDGActualizadas = reservasFiltradas.map(reserva => reserva.upload_date);
      sethoraReservaDGRA(horasDGActualizadas);   

      const mesesReservadosActualizados = reservasFiltradas.map(reserva => 
        Object.keys(reserva.meses)
          .filter(mes => reserva.meses[mes])
          .sort((a, b) => mesesOrden.indexOf(a.toLowerCase()) - mesesOrden.indexOf(b.toLowerCase()))
      );
      setMesesReservadosRA(mesesReservadosActualizados);

      const diasReservadosActualizados = reservasFiltradas.map(reserva => 
        Object.keys(reserva.dias)
          .filter(dia => reserva.dias[dia].seleccionado)
          .sort((a, b) => diasOrden.indexOf(a.toLowerCase()) - diasOrden.indexOf(b.toLowerCase()))
      );
      setDiasReservadosRA(diasReservadosActualizados);

      const horaDesdeActualizados = reservasFiltradas.map(reserva => 
        Object.keys(reserva.dias)
          .filter(dia => reserva.dias[dia].seleccionado)
          .sort((a, b) => diasOrden.indexOf(a.toLowerCase()) - diasOrden.indexOf(b.toLowerCase()))
          .map(dia => reserva.dias[dia].horaDesde)
      );
      setHorasDesdeReservadasRA(horaDesdeActualizados);

      const horaHastaActualizados = reservasFiltradas.map(reserva => 
        Object.keys(reserva.dias)
          .filter(dia => reserva.dias[dia].seleccionado)
          .sort((a, b) => diasOrden.indexOf(a.toLowerCase()) - diasOrden.indexOf(b.toLowerCase()))
          .map(dia => reserva.dias[dia].horaHasta)
      );
      setHorasHastaReservadasRA(horaHastaActualizados);

      const canchasActualizadas = reservasFiltradas.map(reserva => 
        Object.keys(reserva.dias)
          .filter(dia => reserva.dias[dia].seleccionado)
          .sort((a, b) => diasOrden.indexOf(a.toLowerCase()) - diasOrden.indexOf(b.toLowerCase()))
          .map(dia => reserva.dias[dia].cancha)
      );
      setCanchasReservadasRA(canchasActualizadas);

      const equiposActualizados = reservasFiltradas.map(reserva => 
        Object.keys(reserva.dias)
          .filter(dia => reserva.dias[dia].seleccionado)
          .sort((a, b) => diasOrden.indexOf(a.toLowerCase()) - diasOrden.indexOf(b.toLowerCase()))
          .map(dia => reserva.dias[dia].equipo)
      );
      setEquiposReservadosRA(equiposActualizados);

    } else {

      const uDEActualizados = reservasFiltradas.map(reserva => reserva.user_email);
      setusuariosReservasRADE(uDEActualizados);    

      const horasDEActualizadas = reservasFiltradas.map(reserva => reserva.upload_date);
      sethoraReservaRADE(horasDEActualizadas);

      const fechasActualizadas = reservasFiltradas.map(reserva => reserva.dia_esp.fecha);
      setDEfechasReservadasRA(fechasActualizadas);

      const hdDEActualizadas = reservasFiltradas.map(reserva => reserva.dia_esp.horaDesde);
      setDEhorasDesdeReservadasRA(hdDEActualizadas);

      const hhDEActualizadas = reservasFiltradas.map(reserva => reserva.dia_esp.horaHasta);
      setDEhorasHastaReservadasRA(hhDEActualizadas);

      const cDEActualizadas = reservasFiltradas.map(reserva => reserva.dia_esp.cancha);
      setDEcanchasReservadasRA(cDEActualizadas);

      const eDEActualizadas = reservasFiltradas.map(reserva => reserva.dia_esp.equipo);
      setDEequiposReservadosRA(eDEActualizadas);
    }
  }, [reservasEspecialesRA, tipoReserva, tipoReservaRARR, mesesOrden, diasOrden]);

  useEffect(() => {
    const reservasFiltradas = reservasEspecialesRR.filter(reserva => reserva.tipo === tipoReservaRARR);
    setReservasFiltradasRR(reservasFiltradas);

    if (tipoReservaRARR === "DG") {

    const usuariosActualizados = reservasFiltradas.map(reserva => reserva.user_email);
    setusuariosReservasDGRR(usuariosActualizados);    

    const horasDGActualizadas = reservasFiltradas.map(reserva => reserva.upload_date);
    sethoraReservaDGRR(horasDGActualizadas);   

    const mesesReservadosActualizados = reservasFiltradas.map(reserva => 
      Object.keys(reserva.meses)
        .filter(mes => reserva.meses[mes])
        .sort((a, b) => mesesOrden.indexOf(a.toLowerCase()) - mesesOrden.indexOf(b.toLowerCase()))
    );
    setMesesReservadosRR(mesesReservadosActualizados);

    const diasReservadosActualizados = reservasFiltradas.map(reserva => 
      Object.keys(reserva.dias)
        .filter(dia => reserva.dias[dia].seleccionado)
        .sort((a, b) => diasOrden.indexOf(a.toLowerCase()) - diasOrden.indexOf(b.toLowerCase()))
    );
    setDiasReservadosRR(diasReservadosActualizados);

    const horaDesdeActualizados = reservasFiltradas.map(reserva => 
      Object.keys(reserva.dias)
        .filter(dia => reserva.dias[dia].seleccionado)
        .sort((a, b) => diasOrden.indexOf(a.toLowerCase()) - diasOrden.indexOf(b.toLowerCase()))
        .map(dia => reserva.dias[dia].horaDesde)
    );
    setHorasDesdeReservadasRR(horaDesdeActualizados);

    const horaHastaActualizados = reservasFiltradas.map(reserva => 
      Object.keys(reserva.dias)
        .filter(dia => reserva.dias[dia].seleccionado)
        .sort((a, b) => diasOrden.indexOf(a.toLowerCase()) - diasOrden.indexOf(b.toLowerCase()))
        .map(dia => reserva.dias[dia].horaHasta)
    );
    setHorasHastaReservadasRR(horaHastaActualizados);

    const canchasActualizadas = reservasFiltradas.map(reserva => 
      Object.keys(reserva.dias)
        .filter(dia => reserva.dias[dia].seleccionado)
        .sort((a, b) => diasOrden.indexOf(a.toLowerCase()) - diasOrden.indexOf(b.toLowerCase()))
        .map(dia => reserva.dias[dia].cancha)
    );
    setCanchasReservadasRR(canchasActualizadas);

    const equiposActualizados = reservasFiltradas.map(reserva => 
      Object.keys(reserva.dias)
        .filter(dia => reserva.dias[dia].seleccionado)
        .sort((a, b) => diasOrden.indexOf(a.toLowerCase()) - diasOrden.indexOf(b.toLowerCase()))
        .map(dia => reserva.dias[dia].equipo)
    );
    setEquiposReservadosRR(equiposActualizados);

  } else {

    const uDEActualizados = reservasFiltradas.map(reserva => reserva.user_email);
    setusuariosReservasRRDE(uDEActualizados);    

    const horasDEActualizadas = reservasFiltradas.map(reserva => reserva.upload_date);
    sethoraReservaRRDE(horasDEActualizadas);

    const fechasActualizadas = reservasFiltradas.map(reserva => reserva.dia_esp.fecha);
    setDEfechasReservadasRR(fechasActualizadas);

    const hdDEActualizadas = reservasFiltradas.map(reserva => reserva.dia_esp.horaDesde);
    setDEhorasDesdeReservadasRR(hdDEActualizadas);

    const hhDEActualizadas = reservasFiltradas.map(reserva => reserva.dia_esp.horaHasta);
    setDEhorasHastaReservadasRR(hhDEActualizadas);

    const cDEActualizadas = reservasFiltradas.map(reserva => reserva.dia_esp.cancha);
    setDEcanchasReservadasRR(cDEActualizadas);

    const eDEActualizadas = reservasFiltradas.map(reserva => reserva.dia_esp.equipo);
    setDEequiposReservadosRR(eDEActualizadas);
    }
  }, [reservasEspecialesRR, tipoReserva, tipoReservaRARR, mesesOrden, diasOrden]);

  
  const obtenerFechasParaDiaSemana = (mes, año, dia, fechaActual) => {

    const mesNumero = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
      .indexOf(mes.toLowerCase()) + 1;  
  
    const diaNumero = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
      .indexOf(dia.toLowerCase());  
  
    if (mesNumero === 0 || diaNumero === -1) {
      return [];  
    }
  
    const inicioMes = startOfMonth(new Date(año, mesNumero - 1)); 
    const finMes = endOfMonth(new Date(año, mesNumero - 1)); 
  
    if (!(fechaActual instanceof Date)) {
      console.error("fechaActual debe ser una instancia de Date.");
      return [];
    }
  
    const fechaActualEnChile = toZonedTime(fechaActual, zonaChile);
  
    let fecha = inicioMes;
    const fechas = [];
  
    while (fecha <= finMes) {
      if (fecha.getDay() === diaNumero && fecha >= fechaActualEnChile) {
        const fechaZonificada = toZonedTime(fecha, zonaChile);
        fechas.push(format(fechaZonificada, "dd-MM-yyyy"));
      }
      fecha = addDays(fecha, 1);  
    }
  
    return fechas;  
  };


  const aceptarReserva = async (reservaId, id) => {
    const reserva = reservasEspeciales.find((reserva) => reserva._id === reservaId);
  
    if (!reserva) {
      setErrorWithTimeout("No se encontró la reserva.");
      return;
    }
  
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorWithTimeout("No se encontró el token de autenticación.");
      return;
    }
  
    setRes_load(true); 
    try {
      const documentos = [];
      const añoActual = new Date().getFullYear();
      const fechaActual = new Date();
      if (tipoReserva === "DG") {
        mesesReservados[id].forEach((mes) => {
          diasReservados[id].forEach((dia, index_dia) => {
            const fechas = obtenerFechasParaDiaSemana(
              mes,
              añoActual,
              dia,
              fechaActual
            );
            const horaInicio = parseInt(
              horasDesdeReservadas[id][index_dia].split(":")[0]
            );
            const horaFin = parseInt(
              horasHastaReservadas[id][index_dia].split(":")[0]
            );
            fechas.forEach((fecha) => {
              for (let hora = horaInicio; hora < horaFin; hora += 2) {
                documentos.push({
                  fecha: fecha,
                  hora: `${hora.toString().padStart(2, "0")}:00`,
                  cancha: canchasReservadas[id][index_dia],
                  equipo: equiposReservados[id][index_dia],
                  id_reserva_especial: reserva._id,
                  email_usuario_reserva_especial: reserva.user_email,
                });
              }
            });
          });
        });
      } else if (tipoReserva === "DE") {
        const horaInicio = parseInt(DEhorasDesdeReservadas[id].split(":")[0]);
        const horaFin = parseInt(DEhorasHastaReservadas[id].split(":")[0]);
  
        for (let hora = horaInicio; hora < horaFin; hora += 2) {
          documentos.push({
            fecha: DEfechasReservadas[id],
            hora: `${hora.toString().padStart(2, "0")}:00`,
            cancha: DEcanchasReservadas[id],
            equipo: DEequiposReservados[id],
            id_reserva_especial: reserva._id,
            email_usuario_reserva_especial: reserva.user_email,
          });
        }
      }
  
      const requestData = {
        documentos,
        reserva,
      };
  
      const response = await fetch(
        "http://localhost:5000/aceptar_reserva_especial",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        setErrorWithTimeout(
          errorData.message || "Error al aceptar la reserva."
        );
        console.log(errorData);
      } else {
        setModalMessage("La reserva especial fue aceptada con éxito.");
        setIsSuccessModalOpen(true);
        const r = await response.json();
        console.log(r);
        setLlamada(!llamada);
      }
    } catch (error) {
      console.error("Error al aceptar la reserva:", error);
      setErrorWithTimeout(
        "Error al conectar con el servidor para aceptar la reserva."
      );
    } finally {
      setRes_load(false); 
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
    setRes_load(true);
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
        setModalMessage("La reserva especial fue rechazada con éxito.");
        setIsSuccessModalOpen(true); 
        setLlamada(!llamada); 
      }
    } catch (error) {
      console.error('Error al rechazar la reserva:', error);
      setErrorWithTimeout('Error al conectar con el servidor para rechazar la reserva.');
    } finally {
      setRes_load(false); 
    }
  };

  const eliminarReserva = async (reservaId) => {
    const reserva = reservasEspecialesRA.find(reserva => reserva._id === reservaId);
  
    if (!reserva) {
      setErrorWithTimeout('No se encontró la reserva.');
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorWithTimeout('No se encontró el token de autenticación.');
      return;
    }
    setRes_load(true);
    try {
      const response = await fetch('http://localhost:5000/eliminar_reserva_especial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(reserva), 
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setErrorWithTimeout(errorData.error || 'Error al eliminar la reserva.');
      } else {
        setModalMessage("La reserva especial fue eliminada con éxito.");
        setIsSuccessModalOpen(true);
        setLlamada(!llamada);  // Actualizar el estado de llamada para refrescar la lista
      }
    } catch (error) {
      console.error('Error al eliminar la reserva:', error);
      setErrorWithTimeout('Error al conectar con el servidor para eliminar la reserva.');
    } finally {
      setRes_load(false); 
    }
  };
  
  

  const handleAction = (action, reservaId, id) => {
    setCurrentAction(action); 
    setReservaIdToConfirm(reservaId);
    setReservaIndex(id)  
    setIsModalOpen(true); 
  };
  
  const handleConfirmAction = (confirm) => {
    if (confirm) {
      if (currentAction === 'aceptar') {
        setMsjes_load("Creando reserva especial...")
        aceptarReserva(reservaIdToConfirm, reservaIndex);
      } else if (currentAction === 'rechazar') {
        setMsjes_load("Rechazando reserva especial...")
        rechazarReserva(reservaIdToConfirm);
      } else if (currentAction === 'eliminar') {
        setMsjes_load("Eliminando reserva especial...")
        eliminarReserva(reservaIdToConfirm);
      }
    }
    setIsModalOpen(false); 
    setReservaIdToConfirm(null);  
    setReservaIndex(null);
    setCurrentAction(null); 
  };
  
  return (
    <div className="reservas-especiales-container">
      {error && (
        <p ref={errorRef} className="error">
          {error}
        </p>
      )}
      <h2 className="title-reservas">Reservas Especiales</h2>
      <div className="tipo-reserva">
        <label>
          Tipo de Reserva:
          <select value={tipoReserva} onChange={(e) => setTipoReserva(e.target.value)}>
            <option value="DG">Solicitudes Días en General</option>
            <option value="DE">Solicitudes Días en Específico</option>
            <option value="RA">Reservas Especiales Aprobadas</option>
            <option value="RR">Reservas Especiales Rechazadas</option>
          </select>
        </label>
      </div>
  
      {isSuccessModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>{modalMessage}</p>
            <button onClick={() => setIsSuccessModalOpen(false)}>Aceptar</button>
          </div>
        </div>
      )}

      {res_load && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>{msjres_load}</p>
        </div>
      )}

      {loading && (<p className="loading-text">Cargando reservas...</p>)}

      {!loading && reservasFiltradasDGorDE.length === 0 && tipoReserva === "DG" && (
        <div className="empty-message">
          <p className="no-reservas-text">No hay solicitudes de reservas especiales de días en general.</p>
        </div>
      )}

      {!loading && reservasFiltradasDGorDE.length === 0 && tipoReserva === "DE" && (
        <div className="empty-message">
          <p className="no-reservas-text">No hay solicitudes de reservas especiales de días en específico.</p>
        </div>
      )}
      
      {!loading && reservasFiltradasDGorDE.length > 0 && (tipoReserva === "DG" || tipoReserva === "DE") && (
        <div className="reservas-list">
          {tipoReserva === "DG" ? (
            usuariosReservasDG.map((usuario, indexUsuario) => (
              <div key={indexUsuario} className="reserva-item">
                <p><strong>Usuario E-mail:</strong> {usuario}</p>
                <p><strong>Fecha de Envio:</strong> {horaReservaDG[indexUsuario]}</p>
                <p><strong>Mes:</strong>{mesesReservados[indexUsuario].join(', ')}</p>
                {diasReservados[indexUsuario]?.length > 0 && (
                  <div className="dia-item-container">
                    {diasReservados[indexUsuario].map((dia, indexDia) => (
                      <div key={indexDia} className="dia-item">
                        <p><strong>Día:</strong> {dia}</p>
                        <p><strong>Hora Desde:</strong> {horasDesdeReservadas[indexUsuario]?.[indexDia]}</p>
                        <p><strong>Hora Hasta:</strong> {horasHastaReservadas[indexUsuario]?.[indexDia]}</p>
                        <p><strong>Cancha:</strong> {canchasReservadas[indexUsuario]?.[indexDia]}</p>
                        <p><strong>Equipo:</strong> {equiposReservados[indexUsuario]?.[indexDia]}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="button-group">
                  <button onClick={() => manejarPDF(reservasFiltradasDGorDE[indexUsuario]?._id, "descargar")}>Descargar PDF</button>
                  <button onClick={() => manejarPDF(reservasFiltradasDGorDE[indexUsuario]?._id, "ver")}>Ver PDF</button>
                  <button onClick={() => handleAction('aceptar', reservasFiltradasDGorDE[indexUsuario]?._id, indexUsuario)}>Aceptar</button>
                  <button onClick={() => handleAction('rechazar', reservasFiltradasDGorDE[indexUsuario]?._id, indexUsuario)}>Rechazar</button>
                </div>
              </div>
            ))
          ) : (
            usuariosReservasDE.map((usuario, indexUsuario) => (
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
                  <button onClick={() => handleAction('aceptar', reservasFiltradasDGorDE[indexUsuario]?._id, indexUsuario)}>Aceptar</button>
                  <button onClick={() => handleAction('rechazar', reservasFiltradasDGorDE[indexUsuario]?._id, indexUsuario)}>Rechazar</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!loading && tipoReserva === "RA" && (
        <div>
          <h3>Reservas Aprobadas</h3>
          <label>
            Tipo de Reserva:
            <select value={tipoReservaRARR} onChange={(e) => setTipoReservaRARR(e.target.value)}>
              <option value="DG">Días en General</option>
              <option value="DE">Días en Específico</option>
            </select>
          </label>

          {reservasFiltradasRA.length === 0 && tipoReservaRARR === "DG" && (
            <div className="empty-message">
              <p className="no-reservas-text">No hay reservas de dias en general aprobadas.</p>
            </div>
          )}

          {reservasFiltradasRA.length === 0 && tipoReservaRARR === "DE" && (
            <div className="empty-message">
              <p className="no-reservas-text">No hay reservas de dias en específico aprobadas.</p>
            </div>
          )}

          {tipoReservaRARR === "DG" && reservasEspecialesRA.length > 0 && (
            usuariosReservasDGRA.map((usuario, indexUsuario) => (
              <div key={indexUsuario} className="reserva-item">
                <p><strong>Usuario E-mail:</strong> {usuario}</p>
                <p><strong>Fecha de Envio:</strong> {horaReservaDGRA[indexUsuario]}</p>
                <p><strong>Mes:</strong> {mesesReservadosRA[indexUsuario].join(", ")}</p>
                {diasReservadosRA[indexUsuario]?.length > 0 && (
                  <div className="dia-item-container">
                    {diasReservadosRA[indexUsuario].map((dia, indexDia) => (
                      <div key={indexDia} className="dia-item">
                        <p><strong>Día:</strong> {dia}</p>
                        <p><strong>Hora Desde:</strong> {horasDesdeReservadasRA[indexUsuario]?.[indexDia]}</p>
                        <p><strong>Hora Hasta:</strong> {horasHastaReservadasRA[indexUsuario]?.[indexDia]}</p>
                        <p><strong>Cancha:</strong> {canchasReservadasRA[indexUsuario]?.[indexDia]}</p>
                        <p><strong>Equipo:</strong> {equiposReservadosRA[indexUsuario]?.[indexDia]}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="button-group">
                  <button onClick={() => manejarPDF(reservasFiltradasRA[indexUsuario]?._id, "descargar")}>Descargar PDF</button>
                  <button onClick={() => manejarPDF(reservasFiltradasRA[indexUsuario]?._id, "ver")}>Ver PDF</button>
                  <button onClick={() => handleAction('eliminar', reservasFiltradasRA[indexUsuario]?._id, indexUsuario)}>Eliminar Reserva</button>
                </div>
              </div>
            ))
          )} 
          {tipoReservaRARR === "DE" && reservasEspecialesRA.length > 0 &&(
            usuariosReservasRADE.map((usuario, indexUsuario) => (
              <div key={indexUsuario} className="reserva-item">
                <p><strong>Usuario E-mail:</strong> {usuario}</p>
                <p><strong>Fecha de Envio:</strong> {horaReservaRADE[indexUsuario]}</p>
                <p><strong>Fecha de Reserva:</strong> {DEfechasReservadasRA[indexUsuario]}</p>
                <p><strong>Hora Desde:</strong> {DEhorasDesdeReservadasRA[indexUsuario]}</p>
                <p><strong>Hora Hasta:</strong> {DEhorasHastaReservadasRA[indexUsuario]}</p>
                <p><strong>Cancha:</strong> {DEcanchasReservadasRA[indexUsuario]}</p>
                <p><strong>Equipo:</strong> {DEequiposReservadosRA[indexUsuario]}</p>
                <div className="button-group">
                  <button onClick={() => manejarPDF(reservasFiltradasRA[indexUsuario]?._id, "descargar")}>Descargar PDF</button>
                  <button onClick={() => manejarPDF(reservasFiltradasRA[indexUsuario]?._id, "ver")}>Ver PDF</button>
                  <button onClick={() => handleAction('eliminar', reservasFiltradasRA[indexUsuario]?._id, indexUsuario)}>Eliminar Reserva</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!loading && tipoReserva === "RR" && (
        <div>
          <h3>Reservas Rechazadas</h3>
          <label>
            Tipo de Reserva:
            <select value={tipoReservaRARR} onChange={(e) => setTipoReservaRARR(e.target.value)}>
              <option value="DG">Días en General</option>
              <option value="DE">Días en Específico</option>
            </select>
          </label>

          {reservasFiltradasRR.length === 0 && tipoReservaRARR === "DG" && (
            <div className="empty-message">
              <p className="no-reservas-text">No hay reservas de dias en general rechazadas.</p>
            </div>
          )}

          {reservasFiltradasRR.length === 0 && tipoReservaRARR === "DE" && (
            <div className="empty-message">
              <p className="no-reservas-text">No hay reservas de dias en específico rechazadas.</p>
            </div>
          )}

          {tipoReservaRARR === "DG" && reservasEspecialesRR.length > 0 && (
            usuariosReservasDGRR.map((usuario, indexUsuario) => (
              <div key={indexUsuario} className="reserva-item">
                <p><strong>Usuario E-mail:</strong> {usuario}</p>
                <p><strong>Fecha de Envio:</strong> {horaReservaDGRR[indexUsuario]}</p>
                <p><strong>Mes:</strong> {mesesReservadosRR[indexUsuario].join(", ")}</p>
                {diasReservadosRR[indexUsuario]?.length > 0 && (
                  <div className="dia-item-container">
                    {diasReservadosRR[indexUsuario].map((dia, indexDia) => (
                      <div key={indexDia} className="dia-item">
                        <p><strong>Día:</strong> {dia}</p>
                        <p><strong>Hora Desde:</strong> {horasDesdeReservadasRR[indexUsuario]?.[indexDia]}</p>
                        <p><strong>Hora Hasta:</strong> {horasHastaReservadasRR[indexUsuario]?.[indexDia]}</p>
                        <p><strong>Cancha:</strong> {canchasReservadasRR[indexUsuario]?.[indexDia]}</p>
                        <p><strong>Equipo:</strong> {equiposReservadosRR[indexUsuario]?.[indexDia]}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="button-group">
                  <button onClick={() => manejarPDF(reservasFiltradasRR[indexUsuario]?._id, "descargar")}>Descargar PDF</button>
                  <button onClick={() => manejarPDF(reservasFiltradasRR[indexUsuario]?._id, "ver")}>Ver PDF</button>
                </div>
              </div>
            ))
          )} 
          {tipoReservaRARR === "DE" && reservasEspecialesRR.length > 0 && (
            usuariosReservasRRDE.map((usuario, indexUsuario) => (
              <div key={indexUsuario} className="reserva-item">
                <p><strong>Usuario E-mail:</strong> {usuario}</p>
                <p><strong>Fecha de Envio:</strong> {horaReservaRRDE[indexUsuario]}</p>
                <p><strong>Fecha de Reserva:</strong> {DEfechasReservadasRR[indexUsuario]}</p>
                <p><strong>Hora Desde:</strong> {DEhorasDesdeReservadasRR[indexUsuario]}</p>
                <p><strong>Hora Hasta:</strong> {DEhorasHastaReservadasRR[indexUsuario]}</p>
                <p><strong>Cancha:</strong> {DEcanchasReservadasRR[indexUsuario]}</p>
                <p><strong>Equipo:</strong> {DEequiposReservadosRR[indexUsuario]}</p>
                <div className="button-group">
                  <button onClick={() => manejarPDF(reservasFiltradasRR[indexUsuario]?._id, "descargar")}>Descargar PDF</button>
                  <button onClick={() => manejarPDF(reservasFiltradasRR[indexUsuario]?._id, "ver")}>Ver PDF</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>¿Estás seguro de que deseas {currentAction === 'aceptar' ? 'aceptar' : currentAction === 'rechazar' ? 'rechazar' : 'eliminar'} esta reserva?</p>
            <button onClick={() => handleConfirmAction(true)}>Sí</button>
            <button onClick={() => handleConfirmAction(false)}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservasEspeciales;