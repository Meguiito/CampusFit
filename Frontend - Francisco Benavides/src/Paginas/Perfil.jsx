import React from 'react';
import styled from 'styled-components';

function Perfil() {
  return (
    <Main>
      <Imagen>
        <Persona src="/imgUCT/Muestra.png" alt="Perfil" />
      </Imagen>
      <DatosPersonales>
        <Datos>
        <h2>Datos Personales</h2>
          <ul>
            <li>Rut: </li>
            <li>Apellido Paterno: </li>
            <li>Apellido Materno: </li>
            <li>Nombres: </li>
            <li>E-Mail UCT: </li>
          </ul>
        </Datos>
        <Reservas>
        <h2>Reservas</h2>
          <ul>
            <li>Cancha y equipo: </li>
            <li>Dia y hora: </li>
          </ul>
        </Reservas>
      </DatosPersonales>
    </Main>
  );
}

export default Perfil;

const Main = styled.div`
  background-color: #85C1E9;´
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  margin: 20px;
  border-radius: 10px;
`;

const Imagen = styled.div`
  margin-bottom: 20px;
`;

const Persona = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
`;

const DatosPersonales = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;

    ul {
    list-style: none;
    padding: 0;
    margin: 0%;
  }

`;

const Datos = styled.div`
  width: 45%;
`;

const Reservas = styled.div`
  width: 45%;
`;
