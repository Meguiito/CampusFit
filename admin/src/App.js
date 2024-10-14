import './App.css';
import Navbar from './Navbar/Navbar';
import Inicio from './Paginas/Inicio';
import Usuarios from './Paginas/Usuarios';
import Reservas from './Paginas/Reservas';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Inicio" element={<Inicio />} />
        <Route path="/Usuarios" element={<Usuarios />} />
        <Route path="/Reservas" element={<Reservas />} />
      </Routes>
    </Router>
  );
}

export default App;
