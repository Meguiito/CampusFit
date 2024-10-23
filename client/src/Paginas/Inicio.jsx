import React from 'react'; 
import '../Estilos/Inicio.css'; 

function Inicio() {
  const token = localStorage.getItem('token');

  return (
    <div>
      <main>
        <div className="cuerpo">
          <div className="circulo">
            {token ? (
              <div className="reserva-button">
                <a href="/ReservayEquipo"><span>Reserva tu hora y Equipo</span></a>
              </div>
            ) : (
            <div className="auth-buttons center">
              <div className="auth-button1 btn-1">
                <a href="/Login"><span>Iniciar Sesión</span></a>
              </div>
              <div className="auth-button2 btn-2">
                <a href="/Register"><span>Registrarse</span></a>
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
