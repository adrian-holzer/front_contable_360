// src/components/PrivateRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUsuarioLogueado } from './authService'; // Importa tus funciones de authService

interface PrivateRouteProps {
  children: React.ReactNode; // El componente o elementos que PrivateRoute protegerá
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Primero, verifica si hay un token en localStorage (rápido)
      if (isAuthenticated()) {
        // 2. Si hay token, intenta obtener los datos del usuario del backend.
        //    Esto valida el token y lo refresca si es necesario.
        const user = await getUsuarioLogueado();
        if (user) {
          // Si se obtiene el usuario, el token es válido y está autenticado
          setAuthenticated(true);
        } else {
          // Si getUsuarioLogueado retorna null (token inválido/expirado/error),
          // tu authService.ts ya llama a `logout()` para limpiar localStorage.
          setAuthenticated(false);
        }
      } else {
        // No hay token en localStorage, no autenticado
        setAuthenticated(false);
      }
      setLoading(false); // La verificación ha terminado
    };

    checkAuth();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  if (loading) {
    // Puedes mostrar un spinner o un mensaje de "Cargando..." mientras se verifica la autenticación
    return <div>Cargando autenticación...</div>;
  }

  // Si no está autenticado, redirige al usuario a la página de login
  // `replace` asegura que la entrada actual en el historial de navegación sea reemplazada,
  // para que el usuario no pueda simplemente presionar "atrás" para volver a la ruta protegida.
  return authenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;