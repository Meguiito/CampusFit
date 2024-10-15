import './App.css';
import Navbar from './Navbar/NavBar';
import NavbarAdmin from './Navbar/NavbarAdmin';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Inicio from './Paginas/Inicio';
import Perfil from './Paginas/Perfil';
import ReservaEspecial from './Paginas/ReservaEspecial';
import ReservayEquipo from './Paginas/ReservayEquipo';
import TuReservacion from './Paginas/TuReservacion';
import Register from './Paginas/FormularioRegister';
import Login from './Paginas/FormularioLogin';
import InicioAdmin from './Paginas/InicioAdmin';
import UsuariosAdmin from './Paginas/UsuariosAdmin';
import GestionReservas from './Paginas/GestionReservas';
import ReservasEspeciales from './Paginas/ReservasEspeciales';
import { getToken } from './Tokens/authService';

// Componente para rutas privadas de Admin
const PrivateAdminRoute = ({ children }) => {
    const token = getToken();
    const isAdmin = localStorage.getItem('isAdmin') === 'true'; 
    return token && isAdmin ? children : <Navigate to="/Login" />;
};

// Componente para rutas privadas
const PrivateRoute = ({ children }) => {
    const token = getToken();
    return token ? children : <Navigate to="/Login" />;
};

// Componente Layout que maneja la lógica de la interfaz
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
                
                {/* Rutas de Admin protegidas */}
                <Route path="/admin/ReservasEspeciales" element={<PrivateAdminRoute><ReservasEspeciales /></PrivateAdminRoute>} />
                <Route path="/admin/GestionReservas" element={<PrivateAdminRoute><GestionReservas /></PrivateAdminRoute>} />
                <Route path="/admin/inicio" element={<PrivateAdminRoute><InicioAdmin /></PrivateAdminRoute>} />
                <Route path="/admin/usuarios" element={<PrivateAdminRoute><UsuariosAdmin /></PrivateAdminRoute>} />
            </Routes>
        </>
    );
};

// Componente principal de la aplicación
function App() {
    return (
        <Router basename="/"> {/* Configura el basename aquí si es necesario */}
            <Layout />
        </Router>
    );
}

export default App;
