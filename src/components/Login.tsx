// src/components/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './authService'; // Importa tu función de login
import { Lock, User, Calculator } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Limpiar errores previos

    try {
      await login(username, password);
      navigate('/obligaciones'); // O la ruta principal de tu aplicación
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.';
      setError(errorMessage);
      console.error('Error durante el login:', err);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-gray-100" // Cambiado a un gris más claro para el fondo principal
      style={{
        backgroundImage: 'url("/images/accounting-bg.png")', // Asegúrate de que la ruta sea correcta
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-white opacity-70 backdrop-blur-sm"></div> {/* Capa semitransparente y desenfoque */}

      <div className="relative max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-2xl z-10 border border-gray-200"> {/* Añadido z-10, shadow-2xl y border */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-teal-700"> {/* Color más oscuro para el ícono y título */}
            <Calculator className="h-9 w-9 sm:h-12 sm:w-12 animate-bounce-slow" /> {/* Ícono un poco más grande y animación */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">Contable 360</h1> {/* Texto más grande y negrita */}
          </div>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm animate-fade-in" role="alert"> {/* Animación de entrada */}
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-7" onSubmit={handleSubmit}> {/* Espaciado un poco más grande */}
          <div className="rounded-md shadow-sm space-y-5"> {/* Espaciado interno */}
            {/* Campo de Usuario */}
            <div>
              <label htmlFor="username" className="sr-only">
                Nombre de Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500"> {/* Icono más oscuro */}
                  <User size={22} /> {/* Icono un poco más grande */}
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-12 py-3.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-600 focus:border-teal-600 focus:z-10 sm:text-base transition duration-200 ease-in-out" // Bordes más redondeados y transiciones
                  placeholder="Nombre de Usuario"
                />
              </div>
            </div>

            {/* Campo de Contraseña */}
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500"> {/* Icono más oscuro */}
                  <Lock size={22} /> {/* Icono un poco más grande */}
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-12 py-3.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-600 focus:border-teal-600 focus:z-10 sm:text-base transition duration-200 ease-in-out" // Bordes más redondeados y transiciones
                  placeholder="Contraseña"
                />
              </div>
            </div>
          </div>

          {/* Botón de Iniciar Sesión */}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-300 ease-in-out transform hover:scale-105" // Degradado, más grande, más redondeado y animación al pasar el mouse
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;