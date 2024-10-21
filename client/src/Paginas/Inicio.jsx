import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import '../Estilos/Inicio.css'; 

function Inicio() {
  const token = localStorage.getItem('token');
  const [currentImage, setCurrentImage] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);  // Nuevo estado para manejar el fade out
  const images = [
    '/imgUCT/CanchasUCT.jpg',
    '/imgUCT/cancha2.jpg',  // Añade más imágenes
    '/imgUCT/cancha3.jpg',
    '/imgUCT/cancha4.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeOut(true);  // Inicia el efecto de fade out antes de cambiar la imagen
      setTimeout(() => {
        setCurrentImage((prevImage) => (prevImage + 1) % images.length);
        setFadeOut(false);  // Después de cambiar la imagen, vuelve a iniciar el fade in
      }, 1000);  // La duración del fade out debe coincidir con la transición en CSS
    }, 4000);  // Cambia la imagen cada 4 segundos

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div>
      <main>
        <div className="cuerpo">
          <img 
            className={`canchas ${fadeOut ? 'fade-out' : 'fade-in'}`} 
            src={images[currentImage]} 
            alt="Canchas UCT" 
          />
          <div className="circulo">
            {token ? (
              <Link to="/ReservayEquipo">Reserva tu hora y Equipo</Link>
            ) : (
              <div className='auth-buttons'>
                <div className="auth-button1">
                  <Link to="/Login">Iniciar Sesión</Link>
                </div>
                <div className="auth-button2">
                  <Link to="/Register">Registrarse</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer>
        <div className="pie">
          <div className="direcciones">
            <h3>DIRECCIONES <span className="highlight">CAMPUS</span></h3>
            <div>
              <div className="campus1">
                <ul>
                  <li>CAMPUS SAN FRANCISCO</li>
                  <li><i className="icon bx bx-map" /> Manuel Montt 56</li>
                  <li><i className="icon bx bxs-phone" /> Fono: +56 45 2 205 470</li>
                </ul>
              </div>
              <div className="campus2">
                <ul>
                  <li>CAMPUS SAN JUAN PABLO II</li>
                  <li><i className="icon bx bx-map" /> Rudecindo Ortega 02950</li>
                  <li><i className="icon bx bxs-phone" /> Fono: +56 45 2 553 978</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="campus3">
                <ul>
                  <li>CAMPUS MENCHACA LIRA</li>
                  <li><i className="icon bx bx-map" /> Avenida Alemania 0422</li>
                  <li><i className="icon bx bxs-phone" /> Fono: +56 45 2 203 822</li>
                </ul>
              </div>
              <div className="campus4">
                <ul>
                  <li>CAMPUS LUIS RIVAS DEL CANTO</li>
                  <li><i className="icon bx bx-map" /> Callejón Las Mariposas s/n</li>
                  <li><i className="icon bx bxs-phone" /> Fono: +56 45 2 205 596</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="telefonos">
            <h3>TELÉFONOS DE <span className="highlight">UTILIDAD</span></h3>
            <div className="numeros">
              <div className="numero1">
                <ul>
                  <li>PRENSA INSTITUCIONAL</li>
                  <li><i className="icon bx bx-map" /> Avenida Alemania 0211</li>
                  <li><i className="icon bx bxs-phone" /> Fono: +56 45 2 205 428</li>
                </ul>
              </div>
              <div className="numero2">
                <ul>
                  <li>BIENESTAR ESTUDIANTIL</li>
                  <li><i className="icon bx bx-map" /> Manuel Montt 56</li>
                  <li><i className="icon bx bxs-phone" /> Fono: +56 45 2 205 424</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Inicio;
