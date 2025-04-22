import React, { useState, useEffect } from 'react';
import { Menu, UserCircle, ChevronDown, LogOut } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Operativo from '../components/Operativo';
import Configuraciones from '../components/Configuraciones';
import ListaObligaciones from '../components/ListaObligaciones';
import NuevaObligacionPage from '../components/NuevaObligacionPage';
import { AppRoutes } from './AppRoutes'; // Importa las rutas

interface MainContentProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleLogout: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ isSidebarOpen, setIsSidebarOpen, handleLogout }) => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const location = useLocation();
    const [currentSectionTitle, setCurrentSectionTitle] = useState('');

    useEffect(() => {
        switch (location.pathname) {

            case '/':
            setCurrentSectionTitle('Inicio'); // O el título que desees para la raíz
            break;
            
            case '/operativo':
                setCurrentSectionTitle('Operativo');
                break;
            case '/configuraciones':
                setCurrentSectionTitle('Configuraciones');
                break;
            case '/obligaciones':
                setCurrentSectionTitle('Obligaciones');
                break;
            case '/nueva-obligacion':
                setCurrentSectionTitle('Crear Nueva Obligación');
                break;
            default:
                setCurrentSectionTitle('');
                break;
        }
    }, [location.pathname]);

    return (
        <div className="flex-1">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">
                            {currentSectionTitle}
                        </h1>
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <UserCircle className="h-6 w-6 text-gray-600" />
                            <span className="text-gray-700">Juan Pérez</span>
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                                <button
                                    onClick={() => setIsProfileMenuOpen(false)}
                                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                    <UserCircle size={16} />
                                    <span>Mi Perfil</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left"
                                >
                                    <LogOut size={16} />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="p-6">
                <AppRoutes /> {/* Renderiza las rutas desde AppRoutes */}
            </main>
        </div>
    );
};

export default MainContent;