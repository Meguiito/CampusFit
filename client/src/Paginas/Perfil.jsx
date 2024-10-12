// src/components/Perfil.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../Tokens/authService'; // Asegúrate de que la ruta sea correcta

function Perfil() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    rut: '',
    username: '',
    email: '',
    tipo_de_usuario: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/profile'); // Asegúrate de que la URL sea correcta
          setUserData({
            rut: response.data.rut || '',
            username: response.data.username || '',
            email: response.data.email || '',
          });
          setLoading(false);
        } catch (error) {
          console.error('Error al obtener el perfil:', error);
          setError('No se pudo obtener la información del perfil. Por favor, inicia sesión nuevamente.');
          setLoading(false);
          logout();
        }
      } else {
        // Si no hay token, redirigir al inicio de sesión
        navigate('/Login');
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <Main>
        <p>Cargando...</p>
      </Main>
    );
  }

  if (error) {
    return (
      <Main>
        <p>{error}</p>
      </Main>
    );
  }

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
              <li><strong>Rut:</strong> {userData.rut}</li>
              <li><strong>Nombre:</strong> {userData.username}</li>
              <li><strong>E-Mail UCT:</strong> {userData.email}</li>
            </ul>
          </Datos>
        </DatosPersonales>
        <LogoutButton onClick={handleLogout}>Cerrar sesión</LogoutButton>
      </Contenedor>
    </Main>
  );
}

export default Perfil;

// Estilos utilizando styled-components

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

  p {
    color: white;
    font-size: 1.2rem;
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
