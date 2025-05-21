import React, { useState, useEffect } from 'react';
import { Menu, UserCircle, ChevronDown, LogOut, Bell, AlertTriangle, X } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppRoutes } from './AppRoutes'; // Asegúrate de que esta ruta es correcta
import { useNotifications } from '../context/NotificationContext';

interface MainContentProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleLogout: () => void;
    
}

const MainContent: React.FC<MainContentProps> = ({ isSidebarOpen, setIsSidebarOpen, handleLogout }) => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const location = useLocation();
    const [currentSectionTitle, setCurrentSectionTitle] = useState('');
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const navigate = useNavigate();

    // Consume las notificaciones del contexto
    const { notifications, fetchNotifications } = useNotifications();

    console.log(notifications)
    // useEffect para cerrar el menú de perfil/notificaciones cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Verifica si el clic fue fuera del menú de perfil y del botón
            if (!target.closest('.relative')) { // Asume que .relative es el contenedor de los botones de perfil y notificación
                setIsProfileMenuOpen(false);
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    useEffect(() => {
        switch (location.pathname) {
            case '/':
                setCurrentSectionTitle('Inicio');
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
            case '/proximas-a-vencer':
                setCurrentSectionTitle('Asignaciones Próximas a Vencer');
                break;
            case '/asignar-obligaciones': // Asegúrate de añadir la ruta para AsignarObligaciones
                setCurrentSectionTitle('Asignar Obligaciones');
                break;
            // ... otras rutas
            default:
                setCurrentSectionTitle('');
                break;
        }
    }, [location.pathname]);

    const toggleNotifications = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
        setIsProfileMenuOpen(false); // Cierra el menú de perfil si se abre el de notificaciones
    };

    const toggleProfileMenu = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
        setIsNotificationsOpen(false); // Cierra el menú de notificaciones si se abre el de perfil
    }

    const goToNotificationsPage = () => {
        setIsNotificationsOpen(false);
        navigate('/proximas-a-vencer');
    };

    return (
        <div className="flex-1 relative">
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

                    {/* Notification Bell and User Menu */}
                    <div className="relative flex items-center space-x-4">
                        <button
                            onClick={toggleNotifications}
                            className="relative p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <Bell size={24} className={notifications.length > 0 ? 'text-yellow-500 animate-pulse' : 'text-gray-600'} />
                            {notifications.length > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                    {notifications.length}
                                </span>
                            )}
                        </button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={toggleProfileMenu}
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
                                        onClick={() => { setIsProfileMenuOpen(false); /* Lógica para Mi Perfil */ }}
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
                </div>
            </header>

            {/* Notification Panel (Fixed Bottom) */}
            {isNotificationsOpen && (
                <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl z-50 overflow-hidden max-h-96 border border-gray-200">
                    <h2 className="p-3 bg-gray-100 text-gray-800 font-semibold flex justify-between items-center">
                        Notificaciones
                        <button onClick={() => setIsNotificationsOpen(false)} className="text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    </h2>
                    {notifications.length === 0 ? (
                        <div className="p-4 text-gray-600">No hay notificaciones pendientes.</div>
                    ) : (
                        <ul className="overflow-y-auto max-h-72">
                            {notifications.map(notification => (
                                <li key={notification.idAsignacionVencimiento} className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0" onClick={goToNotificationsPage}>
                                    <div className="flex items-start space-x-2">
                                        <AlertTriangle className="text-yellow-500 h-5 w-5 flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="text-sm font-semibold">Vencimiento Próximo</p>
                                            <p className="text-xs text-gray-700 leading-tight">
                                                Obligación: {notification.asignacion.obligacion.nombre}
                                                <br/>
                                                Vence el: {notification.vencimiento.fechaVencimiento}
                                                <br/>
                                                CUIT: {notification.vencimiento.terminacionCuit}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {notifications.length > 0 && (
                                <div className="p-3 bg-gray-100 text-center border-t border-gray-200">
                                    <button onClick={goToNotificationsPage} className="text-blue-600 hover:underline text-sm">
                                        Ver todas las notificaciones
                                    </button>
                                </div>
                            )}
                        </ul>
                    )}
                </div>
            )}

            {/* Main Content Area */}
            <main className="p-6">
                <AppRoutes />
            </main>
        </div>
    );
};

export default MainContent;