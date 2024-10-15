import axios from 'axios';

// Interceptor para agregar el token en las solicitudes
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

// Modificación del método login
export const login = async (email, password) => {
  try {
    const response = await axios.post('http://localhost:5000/users/verify', { email, password });

    // Almacenar el token y si el usuario es administrador
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('isAdmin', response.data.isAdmin ? 'true' : 'false');  // Asegúrate de que sea un string

    console.log("Token:", response.data.access_token);
    return response.data;
  } catch (error) {
    console.error('Error al iniciar sesión', error);
    throw error;
  }
};

// Método logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');  // Eliminar también la información de admin
  window.location.href = '/';
};

// Obtener el token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Obtener si el usuario es admin
export const isAdmin = () => {
  return localStorage.getItem('isAdmin') === 'true';  // Verificar si es admin
};
