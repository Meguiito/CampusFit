import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

function Inicio() {
  return (
    <div>
      <main>
        <Cuerpo>
          <Canchas src="/imgUCT/CanchasUCT.jpg" alt="Canchas UCT" />
          <Circulo>
            <Link to="./Paginas/ReservayEquipo">Reserva tu hora y Equipo</Link>
          </Circulo>
        </Cuerpo>
      </main>
      <footer>
        <Pie>
          <Direcciones>
            <h3>DIRECCIONES <span className="highlight">CAMPUS</span></h3>
            <div>
              <Campus1>
                <ul>
                  <li>CAMPUS SAN FRANCISCO</li>
                  <li><Icon className='bx bx-map' /> Manuel Montt 56</li>
                  <li><Icon className='bx bxs-phone' /> Fono: +56 45 2 205 470</li>
                </ul>
              </Campus1>
              <Campus2>
                <ul>
                  <li>CAMPUS SAN JUAN PABLO II</li>
                  <li><Icon className='bx bx-map' /> Rudecindo Ortega 02950</li>
                  <li><Icon className='bx bxs-phone' /> Fono: +56 45 2 553 978</li>
                </ul>
              </Campus2>
            </div>
            <div>
              <Campus3>
                <ul>
                  <li>CAMPUS MENCHACA LIRA</li>
                  <li><Icon className='bx bx-map' /> Avenida Alemania 0422</li>
                  <li><Icon className='bx bxs-phone' /> Fono: +56 45 2 203 822</li>
                </ul>
              </Campus3>
              <Campus4>
                <ul>
                  <li>CAMPUS LUIS RIVAS DEL CANTO</li>
                  <li><Icon className='bx bx-map' /> Callejón Las Mariposas s/n</li>
                  <li><Icon className='bx bxs-phone' /> Fono: +56 45 2 205 596</li>
                </ul>
              </Campus4>
            </div>
          </Direcciones>
          <Telefonos>
            <h3>TELÉFONOS DE <span className="highlight">UTILIDAD</span></h3>
            <Numeros>
              <Numero1>
                <ul>
                  <li>PRENSA INSTITUCIONAL</li>
                  <li><Icon className='bx bx-map' /> Avenida Alemania 0211</li>
                  <li><Icon className='bx bxs-phone' /> Fono: +56 45 2 205 428</li>
                </ul>
              </Numero1>
              <Numero2>
                <ul>
                  <li>BIENESTAR ESTUDIANTIL</li>
                  <li><Icon className='bx bx-map' /> Manuel Montt 56</li>
                  <li><Icon className='bx bxs-phone' /> Fono: +56 45 2 205 424</li>
                </ul>
              </Numero2>
            </Numeros>
          </Telefonos>
        </Pie>
      </footer>
    </div>
  );
}

export default Inicio;

const Cuerpo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Circulo = styled.div`
  width: 300px; 
  height: 150px;
  background-color: #3498DB;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5em;
  margin-top: 10px;

  a {
    text-decoration: none;
    color: white;
  }

  @media (max-width: 768px) {
    width: 250px;
    height: 170px;
    font-size: 1.2em;
  }
`;

const Canchas = styled.img`
  width: 450px;
  height: auto;

  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 10px;
  }
`;

const Pie = styled.div`
  background-color: #424949;
  display: flex;
  justify-content: space-between;
  padding: 20px;
  color: white;
`;

const Direcciones = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;

  ul {
    list-style: none;
    padding: 20px;
    margin: 0 0 20px;
  }

  > div {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .highlight {
  color: #3498DB;
  font-weight: bold;
}

`;

const Campus1 = styled.div`
  width: 45%;
`;

const Campus2 = styled.div`
  width: 45%;
`;

const Campus3 = styled.div`
  width: 45%;
`;

const Campus4 = styled.div`
  width: 45%;
`;

const Telefonos = styled.div`
  width: 50%;
  text-align: right;

  ul {
    list-style: none;
    padding: 20px;
    margin: 0 0 20px;
  }

  li {
    margin-bottom: 5px;
  }

  .highlight {
  color: #3498DB;
  font-weight: bold;
}
`;

const Numeros = styled.div``;

const Numero1 = styled.div``;

const Numero2 = styled.div``;

const Icon = styled.i`
  margin-right: 8px; 
  color: white;
`;