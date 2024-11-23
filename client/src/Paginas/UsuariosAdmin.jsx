import React, { useEffect, useState, useCallback } from 'react';
import '../Estilos/UsuariosAdmin.css';
import axios from 'axios';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // Función para verificar si el usuario es admin
  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('No autorizado');

      const profileData = await response.json();
      if (profileData.tipo_de_usuario === 'admin') {
        setIsAdmin(true);
        fetchUsuarios();
      } else {
        setError('Acceso denegado: solo los administradores pueden ver esta página.');
      }
    } catch (error) {
      console.error('Error al obtener el perfil del usuario:', error);
      setError('Error al verificar el perfil del usuario');
    }
  }, []);

  // Función para obtener los usuarios desde la base de datos
  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener los usuarios');

      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      setError('Error al obtener la lista de usuarios');
    }
  };

  // Función para abrir el pop-up de sanción
  const handleSancionarClick = (usuario) => {
    setSelectedUser(usuario);
    setShowPopup(true);
  };

  // Función para cerrar el pop-up
  const closePopup = () => {
    setShowPopup(false);
    setSelectedUser(null);
  };

  // Función para sancionar al usuario
  const sancionarUsuario = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/sanciones/${selectedUser.email}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const sancionesPrevias = response.data.sanciones || 0;
  
      if (sancionesPrevias >= 5) {
        alert('El usuario no puede ser sancionado hasta el próximo año.');
        closePopup();
        return;
      }
  
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + (sancionesPrevias + 1) * 7);
  
      // Convertir a ISO 8601
      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();
  
      // Mostrar los datos en consola para verificar
      console.log({ email: selectedUser.email, startDate: formattedStartDate, endDate: formattedEndDate });
  
      // Registrar sanción
      await axios.post(
        'http://localhost:5000/api/sancionar',
        { email: selectedUser.email, startDate: formattedStartDate, endDate: formattedEndDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      alert('Sanción registrada exitosamente.');
      closePopup();
    } catch (error) {
      console.error('Error al sancionar al usuario:', error);
      alert('Error al sancionar al usuario.');
      closePopup();
    }
  };
  
  

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (error) {
    return <p className="Usuarios-error">{error}</p>;
  }

  return (
    <div className="Usuarios-container">
      <h1 className="Usuarios-title">Lista de Usuarios</h1>
      {isAdmin && (
        <div className="Usuarios-user-list">
          {usuarios.map((usuario) => (
            <div className="Usuarios-user-card" key={usuario.email}>
              <h2 className="Usuarios-user-name">{usuario.username}</h2>
              <p className="Usuarios-user-email">Email: {usuario.email}</p>
              <p className="Usuarios-user-rut">RUT: {usuario.rut}</p>
              <button
                className="Usuarios-sancionar-button"
                onClick={() => handleSancionarClick(usuario)}
              >
                Sancionar
              </button>
            </div>
          ))}
        </div>
      )}

      {showPopup && (
        <div className="Usuarios-popup">
          <div className="Usuarios-popup-content">
            <h3>¿Está seguro de sancionar al usuario {selectedUser?.username}?</h3>
            <div className="Usuarios-popup-actions">
              <button onClick={sancionarUsuario}>Sí, sancionar</button>
              <button onClick={closePopup}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;
