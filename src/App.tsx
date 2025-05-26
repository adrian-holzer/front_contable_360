// src/App.tsx
import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

// Importa tus componentes (manteniendo los nombres originales)
import Login from './components/Login';
import Sidebar from './components/Sidebar'; // Sidebar se mantendrá en App.tsx para controlar el overlay
import MainContent from './components/MainContent';

// Importa el nuevo componente PrivateRoute (lo crearemos a continuación)

// Asumo que tienes un componente para rutas no encontradas, si no, puedes crearlo.
import NotFoundPage from './components/NotFoundPage'; // Por ejemplo, src/pages/NotFoundPage.tsx
import PrivateRoute from './components/PrivateRoute';
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // La lógica de isLoggedIn y navigate directa se elimina de aquí.
  // navigate no se usa directamente en App.tsx, se usa en Login y MainContent.

  return (

    
    <Routes>
      {/* Ruta para el componente de Login (no protegida) */}
      <Route path="/login" element={<Login />} />

      {/* Redirige la ruta raíz a /login por defecto */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/*
        Rutas Protegidas:
        Aquí es donde envuelves tu MainContent (que actúa como layout)
        con el componente PrivateRoute.
        Todas las rutas que quieres que sean accesibles solo si el usuario
        está logueado irán dentro de este bloque.
      */}
      <Route
        path="/*" // Esto coincide con cualquier ruta que no sea /login
        element={
          <PrivateRoute>
            {/*
              Aquí, MainContent se renderiza como el layout principal.
              Sidebar y su overlay se controlan desde App.tsx o puedes moverlos a MainContent
              si quieres que sean parte integral de ese layout.
              Por ahora, los mantenemos aquí para replicar tu estructura actual lo más posible.
            */}
            <div className="min-h-screen bg-gray-50 flex">
              <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
              <MainContent
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                // handleLogout ahora será manejado internamente por MainContent
                // o por el authService directamente.
              />
              {/* Overlay para el Sidebar */}
              {isSidebarOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-20"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}
            </div>
          </PrivateRoute>
        }
      />

      {/* Ruta para manejar URLs no encontradas */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;