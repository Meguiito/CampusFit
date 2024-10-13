import React, { useEffect, useState } from 'react';
import '../Styles/Usuarios.css';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);

  // Función para verificar si el usuario es admin
  const fetchProfile = async () => {
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
  };

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
      setUsuarios(data); // Asigna los datos recibidos al estado
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      setError('Error al obtener la lista de usuarios');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Usuarios;
