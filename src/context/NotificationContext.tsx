import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';

interface AsignacionVencimientoProxima {
    id: number;
    vencimiento: {
        fechaVencimiento: string;
        terminacionCuit: string;
    };
    asignacion: {
        obligacion: {
            nombre: string;
        };
    };
}

interface NotificationContextType {
    notifications: AsignacionVencimientoProxima[];
    loadingNotifications: boolean;
    errorNotifications: string | null;
    fetchNotifications: () => void; // Función para recargar las notificaciones manualmente
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<AsignacionVencimientoProxima[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState<boolean>(true);
    const [errorNotifications, setErrorNotifications] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        setLoadingNotifications(true);
        setErrorNotifications(null);
        try {
            const response = await axios.get<AsignacionVencimientoProxima[]>(`${API_BASE_URL}/api/asignaciones-vencimientos/proximas-a-vencer`);
            setNotifications(response.data);
        } catch (error: any) {
            console.error('Error fetching notifications:', error);
            setErrorNotifications('Error al cargar las notificaciones.');
        } finally {
            setLoadingNotifications(false);
        }
    }, []);

    useEffect(() => {
        // Carga inicial de notificaciones
        fetchNotifications();

        // Sondeo cada cierto tiempo (ej. cada 5 minutos)
        // Puedes ajustar la frecuencia según la necesidad de "tiempo real"
        const intervalId = setInterval(fetchNotifications, 5 * 60 * 1000); // Cada 5 minutos

        return () => clearInterval(intervalId); // Limpiar el intervalo al desmontar
    }, [fetchNotifications]);

    return (
        <NotificationContext.Provider value={{ notifications, loadingNotifications, errorNotifications, fetchNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};