import React from 'react'; 
import { useNavigate } from 'react-router-dom';
import '../Styles/Perfil.css'; // Importa el archivo CSS

function Perfil() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Elimina el token de localStorage
    navigate('/login'); // Redirige al usuario a la página de inicio de sesión
  };

  return (
    <div className="perfil-container">
      <h1 className="perfil-title">Tu Perfil</h1>
      <div className="imagen">
        <img className="persona" src="/imgUCT/Muestra.png" alt="Perfil" />
      </div>
      <div className="contenedor">
        <div className="datos-personales">
          <div className="datos">
            <h2>Datos Personales Administrador</h2>
            <ul>
              <li><strong>Rut: </strong>xxxxxx-x</li>
              <li><strong>Nombres: </strong>Nombre</li>
              <li><strong>Apellido Paterno: </strong>Apellido</li>
              <li><strong>Apellido Materno: </strong>Apellido</li>
              <li><strong>E-Mail UCT: </strong>email@uct.cl</li>
            </ul>
          </div>
        </div>
        <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
      </div>
    </div>
  );
}

export default Perfil;
