import './App.css';
import Navbar from './Navbar/NavBar';
import NavbarAdmin from './Navbar/NavbarAdmin';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Inicio from './Paginas/Inicio';
import Perfil from './Paginas/Perfil';
import ReservaEspecial from './Paginas/ReservaEspecial';
import ReservayEquipo from './Paginas/ReservayEquipo';
import TuReservacion from './Paginas/TuReservacion';
import Register from './Paginas/FormularioRegister';
import Login from './Paginas/FormularioLogin';
import InicioAdmin from './Paginas/InicioAdmin';
import UsuariosAdmin from './Paginas/UsuariosAdmin';
import { getToken } from './Tokens/authService';
import { Navigate } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();
  const showNavbar = !['/Register', '/Login'].includes(location.pathname);
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {showNavbar && (isAdminRoute ? <NavbarAdmin /> : <Navbar />)}
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
        <Route path="/ReservaEspecial" element={<PrivateRoute><ReservaEspecial /></PrivateRoute>} />
        <Route path="/ReservayEquipo" element={<PrivateRoute><ReservayEquipo /></PrivateRoute>} />
        <Route path="/TuReservacion" element={<PrivateRoute><TuReservacion /></PrivateRoute>} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />

        {/* Rutas de Admin */}
        <Route path="/admin/inicio" element={<InicioAdmin />} />
        <Route path="/admin/usuarios" element={<UsuariosAdmin />} />
      </Routes>
    </>
  );
};

const PrivateRoute = ({ children }) => {
  const token = getToken();
  return token ? children : <Navigate to="/Login" />;
};

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
