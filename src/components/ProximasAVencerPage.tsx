import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/config';

interface AsignacionVencimientoProxima {
    id: number;
    vencimiento: {
        fechaVencimiento: string;
    };
    asignacion: {
        obligacion: {
            nombre: string;
        };
        cliente: {
            nombre: string;
        };
    };
    estado: string;
    observacion: string | null;
    // ... otras propiedades
}

const ProximasAVencerPage: React.FC = () => {
    const [proximasAVencer, setProximasAVencer] = useState<AsignacionVencimientoProxima[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProximasAVencer = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/asignaciones-vencimientos/proximas-a-vencer`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: AsignacionVencimientoProxima[] = await response.json();
            setProximasAVencer(data);
            console.log(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProximasAVencer();
    }, [fetchProximasAVencer]);

    if (loading) {
        return <div>Cargando asignaciones próximas a vencer...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error al cargar las asignaciones: {error}</div>;
    }

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Asignaciones Próximas a Vencer</h2>
            {proximasAVencer.length === 0 ? (
                <p>No hay asignaciones que venzan en los próximos 10 días.</p>
            ) : (
                <ul className="space-y-4">
                    {proximasAVencer.map(asignacion => (
                        <li key={asignacion.idAsignacionVencimiento} className="bg-white shadow-md rounded-md p-4">
                            <p className="font-semibold">Obligación: {asignacion.asignacion.obligacion.nombre}</p>
                            <p className="text-gray-700">Cliente: {asignacion.asignacion.cliente.nombre}</p>
                            <p className="text-gray-700">Vence el: {asignacion.vencimiento.fechaVencimiento}</p>
                            <p className={`font-semibold ${asignacion.estado === 'PENDIENTE' ? 'text-yellow-500' : asignacion.estado === 'FINALIZADO' ? 'text-green-500' : 'text-gray-500'}`}>
                                Estado: {asignacion.estado}
                            </p>
                            {asignacion.observacion && <p className="text-gray-600">Observación: {asignacion.observacion}</p>}
                            {/* Aquí podrías añadir más detalles o acciones */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ProximasAVencerPage;