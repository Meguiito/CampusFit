import './App.css';
import Navbar from './Navbar/NavBar';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Inicio from './Paginas/Inicio';
import Perfil from './Paginas/Perfil';
import ReservaEspecial from './Paginas/ReservaEspecial';
import ReservayEquipo from './Paginas/ReservayEquipo';
import Register from './Paginas/FormularioRegister';
import Login from './Paginas/FormularioLogin';

const Layout = () => {
  const location = useLocation();
  const showNavbar = !['/Register', '/Login'].includes(location.pathname);

  return (
    <div>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Perfil" element={<Perfil />} />
        <Route path="/ReservaEspecial" element={<ReservaEspecial />} />
        <Route path="/ReservayEquipo" element={<ReservayEquipo />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
