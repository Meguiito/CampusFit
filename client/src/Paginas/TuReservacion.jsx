import React from 'react'; 
import styled from 'styled-components';

function TuReservacion() {
  return (
    <Main>
        <Contenedor>
            <h2>Tu Reservación</h2>
        <Reservacion>
            <Detalle>
            <strong>Día:</strong>
            </Detalle>
            <Detalle>
            <strong>Hora:</strong>
            </Detalle>
            <Detalle>
            <strong>Cancha:</strong>
            </Detalle>
            <Detalle>
            <strong>Equipo:</strong>
            </Detalle>
        </Reservacion>
        </Contenedor>

    </Main>
  );
}

export default TuReservacion;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background: linear-gradient(135deg, #3498DB, #ffffff);
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  margin: 20px auto;
  transition: transform 0.3s ease;

  h2 {
    color: #ffffff;
    margin-bottom: 20px;
    font-size: 2rem;
  }
`;

const Contenedor = styled.div`
    max-width: 90%;
    align-items: center;
`;


const Reservacion = styled.div`
  background-color: #2985ec;
  border-radius: 15px;
  padding: 20px;
  color: white;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
`;

const Detalle = styled.div`
  margin: 10px 0;
  font-size: 1.2rem;

  strong {
    color: #FFD700;
    margin-right: 10px;
  }
`;
