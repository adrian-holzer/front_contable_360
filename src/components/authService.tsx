// src/services/authService.ts
import axios from 'axios';
import { API_BASE_URL } from '../config/config';

export interface UsuarioLogueado {
  idUsuario: number;
  cuit: string;
  nombreUsuario: string;
  nombreApellido: string; // Asegúrate de que este campo exista en tu respuesta de API
  correo: string;
  roles: Array<{ idRole: number; name: string }>;
}

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  usuarioLogueado: UsuarioLogueado;
}

// Función para iniciar sesión
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      username,
      password,
    });

    const { accessToken, tokenType, usuarioLogueado } = response.data;

    // Guardar el token y el tipo de token en localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('tokenType', tokenType);
    //  Guardar el objeto completo del usuario
    console.log(usuarioLogueado.nombreApellido)
    localStorage.setItem('usuarioLogueado', JSON.stringify(usuarioLogueado)); 
    localStorage.setItem('nombreApellido', usuarioLogueado.nombreApellido);

    return response.data;

  } catch (error) {
    console.error('Error durante el login:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error de credenciales');
    } else {
      throw new Error('Error al conectar con el servidor');
    }
  }
};

// Función para obtener los datos del usuario logueado usando el token
export const getUsuarioLogueado = async (): Promise<any> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const tokenType = localStorage.getItem('tokenType');

    if (!accessToken || !tokenType) {
      return null;
    }

    const response = await axios.get(`${API_BASE_URL}/api/auth/userLogueado`, {
      headers: {
        'Authorization': `${tokenType}${accessToken}`,
      },
    });

    // Actualizar el localStorage por si el usuario ha cambiado o para asegurar consistencia
    localStorage.setItem('usuarioLogueado', JSON.stringify(response.data));
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener el usuario logueado:', error);
    if (axios.isAxiosError(error) && error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('Token inválido o expirado. Limpiando sesión.');
      logout(); 
    }
    // No lanzar el error, solo retornar null para que el componente que llama lo maneje
    return null; 
  }
};

// Función para cerrar sesión
export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('tokenType');
  localStorage.removeItem('usuarioLogueado'); // Asegúrate de limpiar también este ítem
};

// Función para verificar si hay un token en localStorage (para mantener la sesión)
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('accessToken') !== null;
};

// Nueva función para obtener el usuario desde localStorage
export const getUsuarioFromLocalStorage = (): UsuarioLogueado | null => {
  const usuarioString = localStorage.getItem('usuarioLogueado');
  if (usuarioString) {
    try {
      return JSON.parse(usuarioString);
    } catch (e) {
      console.error('Error al parsear usuarioLogueado desde localStorage', e);
      return null;
    }
  }
  return null;
};