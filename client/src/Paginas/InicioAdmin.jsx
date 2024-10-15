import React, { useState, useEffect } from 'react';
import '../Estilos/InicioAdmin.css'; // Importamos el archivo CSS para estilos

function InicioAdmin() {
  // Estado para el número de reservas diarias
  const [reservasDiarias, setReservasDiarias] = useState(0);

  // Simulamos la obtención de datos (podrías reemplazar esto con una llamada a una API)
  useEffect(() => {
    const obtenerReservasDiarias = () => {
      // Aquí podrías hacer una llamada a una API para obtener las reservas reales
      setReservasDiarias(5); // Simulamos 5 reservas para este ejemplo
    };

    obtenerReservasDiarias();
  }, []);

  return (
    <div className="inicio">
      <div className="inicio-content">
        <div className="card">
          <h2>Reservas</h2>
          <p>Administra las reservas de los usuarios.</p>
          {/* Contador de reservas */}
          <div className="contador-reservas">
            <span>Reservas diarias: {reservasDiarias}</span>
          </div>
          <button className="inicio-button">Ver Reservas</button>
        </div>
        <div className="card">
          <h2>Reserva Especial</h2>
          <p>Gestiona las reservas especiales.</p>
          <button className="inicio-button">Ver Reservas Especiales</button>
        </div>
      </div>
    </div>
  );
}

export default InicioAdmin;
