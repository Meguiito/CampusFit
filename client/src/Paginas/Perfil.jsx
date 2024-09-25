import React from 'react'; 
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

function Perfil() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/'); 
  };

  return (
    <Main>
      <h2>Tu Perfil</h2>
      <Imagen>
        <Persona src="/imgUCT/Muestra.png" alt="Perfil" />
      </Imagen>
      <Contenedor>
        <DatosPersonales>
          <Datos>
            <h2>Datos Personales</h2>
            <ul>
              <li><strong>Rut:</strong> </li>
              <li><strong>Nombres:</strong> </li>
              <li><strong>Apellido Paterno:</strong> </li>
              <li><strong>Apellido Materno:</strong> </li>
              <li><strong>E-Mail UCT:</strong> </li>
            </ul>
          </Datos>
        </DatosPersonales>
        <LogoutButton onClick={handleLogout}>Cerrar sesión</LogoutButton>
      </Contenedor>
    </Main>
  );
}

export default Perfil;

const Main = styled.div`
  background: linear-gradient(135deg, #3498DB, #ffffff);
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  margin: 20px;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;

  h2 {
    color: white;
  }
`;

const Imagen = styled.div`
  margin-bottom: 20px;
`;

const Persona = styled.img`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 5px solid #2985ec;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
`;

const Contenedor = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 20px;
  align-items: center;
`;

const DatosPersonales = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  background-color: #2985ec;
  border-radius: 15px;
  padding: 20px;
  color: white;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin: 10px 0;
  }

  strong {
    color: #ffffff;
  }
`;

const Datos = styled.div`
  width: 100%;
  text-align: center;

  h2 {
    color: #FFD700;
    margin-bottom: 10px;
    font-size: 1.5rem;
  }
`;

const LogoutButton = styled.button`
  background-color: #FF4B4B;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 10px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #FF3B3B;
  }
`;
