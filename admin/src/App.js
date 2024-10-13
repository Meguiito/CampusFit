import './App.css';
import Navbar from './Navbar/Navbar';
import Inicio from './Paginas/Inicio';
import Usuarios from './Paginas/Usuarios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Inicio" element={<Inicio />} />
        <Route path="/Usuarios" element={<Usuarios />} />
      </Routes>
    </Router>
  );
}

export default App;