import './App.css';
import Navbar from './Navbar/NavBar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Inicio from './Paginas/Inicio';
import Perfil from './Paginas/Perfil';
import ReservaEspecial from './Paginas/ReservaEspecial';
import ReservayEquipo from './Paginas/ReservayEquipo';
import Register from './Paginas/FormularioRegister';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Perfil" element={<Perfil />} />
        <Route path="/ReservaEspecial" element={<ReservaEspecial />} />
        <Route path="/ReservayEquipo" element={<ReservayEquipo />} />
        <Route path="/Register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
