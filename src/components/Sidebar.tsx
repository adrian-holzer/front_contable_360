import React, { useState } from 'react';
import { LayoutDashboard, Calculator, ChevronDown, SendHorizontal, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [isOperativoMenuOpen, setIsOperativoMenuOpen] = useState(false);
  const [isClienteMenuOpen, setIsClienteMenuOpen] = useState(false);
  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleOperativoClick = () => {
    setIsOperativoMenuOpen(!isOperativoMenuOpen);
    // No cerramos otros menús aquí
  };

  const handleClienteClick = () => {
    setIsClienteMenuOpen(!isClienteMenuOpen);
    // No cerramos otros menús aquí
  };

  const handleConfigClick = () => {
    setIsConfigMenuOpen(!isConfigMenuOpen);
    // No cerramos otros menús aquí
  };

  const navigateTo = (path: string) => {
    navigate(path);
    // Ya no cerramos los menús aquí, el estado se mantiene
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out z-30 w-64 bg-white shadow-lg`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 bg-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="h-6 w-6" />
            <h2 className="text-xl font-bold">Contable 360</h2>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-teal-700 rounded-lg">
            {/* Icono X aquí */}
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={handleOperativoClick}
            className={`flex items-center space-x-2 w-full p-3 rounded-lg ${
              location.pathname.startsWith('/operativo') || location.pathname === '/'
                ? 'bg-teal-50 text-teal-600'
                : 'hover:bg-teal-100'
            }`}
          >
            <LayoutDashboard size={20} />
            <span>Operativo</span>
            <ChevronDown
              className={`ml-auto transition-transform ${isOperativoMenuOpen ? 'rotate-180' : ''}`}
              size={16}
            />
          </button>

          {/* Submenu Operativo */}
          <div
            className={`pl-8 space-y-2 transition-all duration-300 ease-in-out ${
              isOperativoMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            } overflow-hidden`}
          >
            <button
              onClick={() => navigateTo('/obligaciones')}
              className={`flex items-center space-x-2 w-full p-3 rounded-lg ${
                location.pathname === '/obligaciones' ? 'bg-teal-50 text-teal-600' : 'hover:bg-teal-100'
              }`}
            >
              <SendHorizontal size={20} />
              <span>Obligaciones</span>
            </button>
            {/* Otros elementos del submenu Operativo */}



<button
            onClick={handleClienteClick}
            className={`flex items-center space-x-2 w-full p-3 rounded-lg ${
              location.pathname === '/no-existe' ? 'bg-teal-50 text-teal-600' : 'hover:bg-teal-100'
            }`}
          >
            <SendHorizontal size={20} />
            <span>Clientes</span>
            <ChevronDown
              className={`ml-auto transition-transform ${isClienteMenuOpen ? 'rotate-180' : ''}`}
              size={16}
            />
          </button>

          {/* Submenu Clientes */}
          <div
            className={`pl-8 space-y-2 transition-all duration-300 ease-in-out ${
              isClienteMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            } overflow-hidden`}
          >
            <button
              onClick={() => navigateTo('/cliente/asignar-obligaciones')}
              className={`flex items-center space-x-2 w-full p-3 rounded-lg ${
                location.pathname === '/cliente/asignar-obligaciones' ? 'bg-teal-50 text-teal-600' : 'hover:bg-teal-100'
              }`}
            >
              <SendHorizontal size={20} />
              <span>Asignar Obligaciones</span>
            </button>
            <button
              onClick={() => navigateTo('/cliente/asignar-responsable')}
              className={`flex items-center space-x-2 w-full p-3 rounded-lg ${
                location.pathname === '/cliente/asignar-responsable' ? 'bg-teal-50 text-teal-600' : 'hover:bg-teal-100'
              }`}
            >
              <SendHorizontal size={20} />
              <span>Asignar Responsable</span>
            </button>
            <button
              onClick={() => navigateTo('/asignaciones/listado')}
              className={`flex items-center space-x-2 w-full p-3 rounded-lg ${
                location.pathname === '/asignaciones/listado' ? 'bg-teal-50 text-teal-600' : 'hover:bg-teal-100'
              }`}
            >
              <SendHorizontal size={20} />
              <span>Listado Asignaciones</span>
            </button>
            {/* Otros elementos del submenu Clientes */}
          </div>



          </div>

          {/* 
          <button
            onClick={handleConfigClick}
            className={`flex items-center space-x-2 w-full p-3 rounded-lg ${
              location.pathname.startsWith('/configuraciones') ? 'bg-teal-50 text-teal-600' : 'hover:bg-teal-100'
            }`}
          >
            <Settings size={20} />
            <span>Configuraciones</span>
            <ChevronDown
              className={`ml-auto transition-transform ${isConfigMenuOpen ? 'rotate-180' : ''}`}
              size={16}
            />
          </button> */}

          {/* Submenu Configuraciones */}
          <div
            className={`pl-8 space-y-2 transition-all duration-300 ease-in-out ${
              isConfigMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            } overflow-hidden`}
          >
            <button
              onClick={() => navigateTo('/configuraciones')}
              className={`flex items-center space-x-2 w-full p-3 rounded-lg ${
                location.pathname === '/configuraciones' ? 'bg-teal-50 text-teal-600' : 'hover:bg-teal-100'
              }`}
            >
              <SendHorizontal size={20} />
              <span>Configuración General</span>
            </button>
            {/* Otros elementos del submenu Configuraciones */}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;