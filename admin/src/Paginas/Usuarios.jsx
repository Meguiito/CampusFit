import React, { useEffect, useState } from 'react';
import '../Styles/Usuarios.css';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);

  // Función para obtener los usuarios desde la base de datos
  const fetchUsuarios = async () => {
    try {
      const response = await fetch('URL_DE_TU_API'); // Reemplaza con la URL de tu API
      const data = await response.json();
      setUsuarios(data); // Asigna los datos recibidos al estado
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  };

  // Llama a la función al montar el componente
  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div className="Usuarios-container">
      <h1 className="Usuarios-title">Lista de Usuarios</h1>
      <div className="Usuarios-user-list">
        {usuarios.map((usuario) => (
          <div className="Usuarios-user-card" key={usuario.id}>
            <h2 className="Usuarios-user-name">{usuario.nombre}</h2>
            <p className="Usuarios-user-email">{usuario.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Usuarios;
