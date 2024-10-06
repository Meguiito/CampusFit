import axios from 'axios';

// Interceptor para agregar el token de autorización en cada solicitud
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Función para iniciar sesión
export const login = async (email, password) => {
  try {
    // Realiza la solicitud de verificación del usuario
    const response = await axios.post('http://localhost:5000/users/verify', { email, password });
    
    // Almacena el token de acceso en el localStorage
    localStorage.setItem('token', response.data.access_token); // Asegúrate de usar access_token
    
    return response.data; // Devuelve los datos del usuario
  } catch (error) {
    // Manejo de errores
    console.error('Error al iniciar sesión', error.response ? error.response.data : error.message);
    throw error; // Lanza el error para manejarlo en el componente
  }
};

// Función para cerrar sesión
export const logout = () => {
  // Elimina el token del localStorage
  localStorage.removeItem('token');
  
  // Redirige al usuario a la página de inicio de sesión
  window.location.href = '/Login';
};

// Función para obtener el token
export const getToken = () => {
  return localStorage.getItem('token'); // Devuelve el token almacenado
};
