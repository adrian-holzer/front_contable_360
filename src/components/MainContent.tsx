// src/components/MainContent.tsx
import React, { useState, useEffect } from 'react';
import { Menu, UserCircle, ChevronDown, LogOut, Bell, AlertTriangle, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppRoutes } from './AppRoutes'; // Asegúrate de que esta ruta es correcta
import { useNotifications } from '../context/NotificationContext';

// Importa las funciones de tu servicio de autenticación
import { logout, getUsuarioFromLocalStorage, UsuarioLogueado } from './authService';

interface MainContentProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MainContent: React.FC<MainContentProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const location = useLocation();
    const [currentSectionTitle, setCurrentSectionTitle] = useState('');
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const navigate = useNavigate();
    // const [usuario, setUsuario] = useState<UsuarioLogueado | null>(null); // Comentado, ya que no se usa directamente 'usuario' sino 'nombreApellido'
    const nombreApellido = localStorage.getItem('nombreApellido');
    const { notifications, fetchNotifications } = useNotifications();

    useEffect(() => {
        // setUsuario(getUsuarioFromLocalStorage()); // Si necesitas el objeto usuario completo, descomenta y usa.
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Solo cierra los menús si el clic es FUERA de:
            // 1. El contenedor del menú de perfil
            // 2. El botón de la campana de notificaciones
            // 3. El panel de notificaciones en sí mismo
            if (
                !target.closest('.profile-menu-container') &&
                !target.closest('.notification-bell-container') &&
                !target.closest('.main-notification-panel') // <--- MODIFICACIÓN AQUÍ
            ) {
                setIsProfileMenuOpen(false);
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []); // El array de dependencias vacío está bien aquí para que se ejecute solo al montar/desmontar

    useEffect(() => {
        switch (location.pathname) {
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
            case '/cliente/asignar-obligaciones':
                setCurrentSectionTitle('Asignar Obligaciones a Cliente');
                break;
            case '/cliente/asignar-responsable':
                setCurrentSectionTitle('Asignar Responsable a Cliente');
                break;
            case '/asignaciones/listado':
                setCurrentSectionTitle('Listado de Asignaciones');
                break;
            case '/asignar-cliente':
                setCurrentSectionTitle('Asignar Cliente');
                break;
            default:
                setCurrentSectionTitle('Panel Principal');
                break;
        }
    }, [location.pathname]);

    const toggleNotifications = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
        setIsProfileMenuOpen(false);
    };

    const toggleProfileMenu = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
        setIsNotificationsOpen(false);
    }

    const goToNotificationsPage = () => {
        console.log('Intentando navegar a /proximas-a-vencer y cerrar panel');
        navigate('/proximas-a-vencer');
        // Cierra el panel después de que la navegación se haya iniciado.
        setIsNotificationsOpen(false); // <--- MODIFICACIÓN AQUÍ (orden y sin redundancia)
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
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
                            className="relative p-2 hover:bg-gray-100 rounded-lg notification-bell-container" // Esta clase es importante para handleClickOutside
                        >
                            <Bell size={24} className={notifications.length > 0 ? 'text-yellow-500 animate-pulse' : 'text-gray-600'} />
                            {notifications.length > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                    {notifications.length}
                                </span>
                            )}
                        </button>

                        {/* User Menu */}
                        <div className="relative profile-menu-container"> {/* Esta clase es importante para handleClickOutside */}
                            <button
                                onClick={toggleProfileMenu}
                                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <UserCircle className="h-6 w-6 text-gray-600" />
                                <span className="text-gray-700">{nombreApellido || 'Cargando...'}</span>
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            </button>

                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
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
                //                                                                                                    AÑADIDA LA CLASE AQUÍ 👇
                <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl z-50 overflow-hidden max-h-96 border border-gray-200 main-notification-panel">
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
                                                <br />
                                                Vence el: {notification.vencimiento.fechaVencimiento}
                                                <br />
                                                CUIT: {notification.vencimiento.terminacionCuit}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {notifications.length > 0 && (
                                <div className="p-3 bg-gray-100 text-center border-t border-gray-200">
                                    {/* El onClick aquí ahora debería funcionar consistentemente */}
                                    <button onClick={goToNotificationsPage} className="text-blue-600 hover:underline text-sm">
                                        Ver todas las notificaciones
                                    </button>
                                </div>
                            )}
                        </ul>
                    )}
                </div>
            )}

            {/* Área principal de contenido */}
            <main className="p-6">
                <AppRoutes />
            </main>
        </div>
    );
};

export default MainContent;