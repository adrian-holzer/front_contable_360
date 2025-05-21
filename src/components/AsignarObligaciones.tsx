import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, X, Search } from 'lucide-react';
import { API_BASE_URL } from '../config/config';
import { useNotifications } from '../context/NotificationContext'; // Importar el hook de notificaciones

interface Cliente {
    idCliente: number;
    nombre?: string;
    razonSocial?: string;
    cuit: string;
}

interface Obligacion {
    id: number;
    nombre: string;
    descripcion?: string | null;
}

interface Asignacion {
    idAsignacion: number;
    observacion: string;
    cliente: { idCliente: number };
    obligacion: { id: number };
    activo: boolean;
}

const AsignarObligaciones: React.FC = () => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loadingClientes, setLoadingClientes] = useState<boolean>(true);
    const [errorClientes, setErrorClientes] = useState<string | null>(null);
    const [obligaciones, setObligaciones] = useState<Obligacion[]>([]);
    const [loadingObligaciones, setLoadingObligaciones] = useState<boolean>(true);
    const [errorObligaciones, setErrorObligaciones] = useState<string | null>(null);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
    const [obligacionesSeleccionadas, setObligacionesSeleccionadas] = useState<number[]>([]);
    const [obligacionesAsignadasInicialmente, setObligacionesAsignadasInicialmente] = useState<number[]>([]);
    const [modalClientesVisible, setModalClientesVisible] = useState<boolean>(true);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [observacion, setObservacion] = useState<string>('');
    const [searchTermCliente, setSearchTermCliente] = useState<string>('');
    const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
    const [searchTermObligacion, setSearchTermObligacion] = useState<string>('');
    const [filteredObligaciones, setFilteredObligaciones] = useState<Obligacion[]>([]);
    const { fetchNotifications } = useNotifications(); // Usar el hook de notificaciones

    const fetchClientes = useCallback(async () => {
        setLoadingClientes(true);
        setErrorClientes(null);
        try {
            const response = await axios.get<Cliente[]>(`${API_BASE_URL}/api/clientes`);
            setClientes(response.data);
        } catch (error: any) {
            console.error("Error fetching clientes:", error);
            setErrorClientes("Error al cargar los clientes.");
        } finally {
            setLoadingClientes(false);
        }
    }, []);

    const fetchObligaciones = useCallback(async () => {
        setLoadingObligaciones(true);
        setErrorObligaciones(null);
        try {
            const response = await axios.get<Obligacion[]>(`${API_BASE_URL}/api/obligaciones`);
            setObligaciones(response.data);
        } catch (error: any) {
            console.error("Error fetching obligaciones:", error);
            setErrorObligaciones("Error al cargar las obligaciones.");
        } finally {
            setLoadingObligaciones(false);
        }
    }, []);

    const fetchAsignacionesCliente = useCallback(async (idCliente: number) => {
        try {
            const response = await axios.get<Asignacion[]>(`${API_BASE_URL}/api/asignaciones/cliente/${idCliente}`);
            // Extraer directamente los IDs de las obligaciones asignadas
            const asignadasIds = response.data.map(asignacion => asignacion.obligacion.id);
            setObligacionesAsignadasInicialmente(asignadasIds);
            // Inicialmente, las obligaciones seleccionadas son las que ya están asignadas
            setObligacionesSeleccionadas(asignadasIds);
            console.log("Obligaciones asignadas inicialmente:", asignadasIds); // Para debugging
        } catch (error: any) {
            console.error("Error fetching asignaciones del cliente:", error);
            setMensaje("Error al cargar las asignaciones del cliente.");
            setObligacionesSeleccionadas([]);
            setObligacionesAsignadasInicialmente([]);
        }
    }, []);

    useEffect(() => {
        fetchClientes();
        fetchObligaciones();
    }, [fetchClientes, fetchObligaciones]);

    useEffect(() => {
        const results = clientes.filter(cliente =>
            (cliente.nombre?.toLowerCase().includes(searchTermCliente.toLowerCase()) ||
                cliente.razonSocial?.toLowerCase().includes(searchTermCliente.toLowerCase()) ||
                cliente.cuit.includes(searchTermCliente))
        );
        setFilteredClientes(results);
    }, [searchTermCliente, clientes]);

    useEffect(() => {
        const results = obligaciones.filter(obligacion =>
            obligacion.nombre.toLowerCase().includes(searchTermObligacion.toLowerCase())
        );
        setFilteredObligaciones(results);
    }, [searchTermObligacion, obligaciones]);

    const handleClienteSeleccionado = (cliente: Cliente) => {
        setClienteSeleccionado(cliente);
        setModalClientesVisible(false);
        fetchAsignacionesCliente(cliente.idCliente);
    };

    const toggleObligacionSeleccionada = (idObligacion: number) => {
        if (obligacionesSeleccionadas.includes(idObligacion)) {
            setObligacionesSeleccionadas(obligacionesSeleccionadas.filter(id => id !== idObligacion));
        } else {
            setObligacionesSeleccionadas([...obligacionesSeleccionadas, idObligacion]);
        }
    };

    const handleAsignarObligaciones = async () => {
        if (!clienteSeleccionado) {
            setMensaje('Por favor, selecciona un cliente.');
            return;
        }

        const nuevasObligaciones = obligacionesSeleccionadas; // Cambiado para incluir todas las seleccionadas.

        const observacionToSend = observacion.trim() === '' ? '-' : observacion;
        const payload = {
            idCliente: clienteSeleccionado.idCliente,
            idsObligaciones: nuevasObligaciones,
            observacion: observacionToSend,
        };

        try {
            await axios.post(`${API_BASE_URL}/api/asignaciones`, payload);
            setMensaje('Obligaciones asignadas correctamente.');
            fetchAsignacionesCliente(clienteSeleccionado.idCliente); // Refrescar asignaciones
            fetchNotifications()
            setObservacion('');
        } catch (error: any) {
            console.error('Error asignando obligaciones:', error);
            setMensaje('Error al asignar las obligaciones.');
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Asignar Obligaciones</h2>

            {/* Botón para abrir el modal de clientes cuando no está visible y no hay un cliente seleccionado */}
            {!modalClientesVisible && !clienteSeleccionado && (
                <button
                    onClick={() => setModalClientesVisible(true)}
                    className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Seleccionar Cliente
                </button>
            )}

            {modalClientesVisible && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-xl"> {/* Cambiado de max-w-md a max-w-xl */}
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Seleccionar Cliente</h3>
                            <button onClick={() => setModalClientesVisible(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="relative rounded-md shadow-sm mb-3">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="text-gray-400" size={16} />
                            </div>
                            <input
                                type="text"
                                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Buscar cliente por nombre o CUIT..."
                                value={searchTermCliente}
                                onChange={(e) => setSearchTermCliente(e.target.value)}
                            />
                        </div>
                        {loadingClientes ? (
                            <p>Cargando clientes...</p>
                        ) : errorClientes ? (
                            <p className="text-red-500">{errorClientes}</p>
                        ) : (
                            <div className="overflow-y-auto max-h-96">
                                <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-md">
                                    <thead className="bg-gray-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="py-2 px-4 border-b text-left">ID</th>
                                            <th className="py-2 px-4 border-b text-left">Nombre / Razón Social</th>
                                            <th className="py-2 px-4 border-b text-left">CUIT</th>
                                            <th className="py-2 px-4 border-b text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredClientes.map(cliente => (
                                            <tr key={cliente.idCliente} className="hover:bg-gray-50">
                                                <td className="py-2 px-4 border-b">{cliente.idCliente}</td>
                                                <td className="py-2 px-4 border-b">{cliente.nombre || cliente.razonSocial}</td>
                                                <td className="py-2 px-4 border-b">{cliente.cuit}</td>
                                                <td className="py-2 px-4 border-b text-center">
                                                    <button
                                                        onClick={() => handleClienteSeleccionado(cliente)}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                    >
                                                        Seleccionar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredClientes.length === 0 && !loadingClientes && <p className="text-gray-500 mt-2">No se encontraron clientes.</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {clienteSeleccionado && (
                <div className="mt-6 p-4 border rounded-md shadow-sm bg-white">
                    <h3 className="text-lg font-semibold mb-2">Cliente Seleccionado:</h3>
                    <p className="mb-1"><span className="font-medium">ID:</span> {clienteSeleccionado.idCliente}</p>
                    <p className="mb-2"><span className="font-medium">Nombre/Razón Social:</span> {clienteSeleccionado.nombre || clienteSeleccionado.razonSocial}</p>
                    <button
                        onClick={() => setModalClientesVisible(true)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
                    >
                        Cambiar Cliente
                    </button>

                    <h3 className="text-lg font-semibold mb-2">Listado de Obligaciones</h3>
                    {loadingObligaciones ? (
                        <p>Cargando obligaciones...</p>
                    ) : errorObligaciones ? (
                        <p className="text-red-500">{errorObligaciones}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="relative rounded-md shadow-sm mb-3">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Search className="text-gray-400" size={16} />
                                </div>
                                <input
                                    type="text"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    placeholder="Buscar obligación por nombre..."
                                    value={searchTermObligacion}
                                    onChange={(e) => setSearchTermObligacion(e.target.value)}
                                />
                            </div>
                            <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-md">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-2 px-4 border-b text-left">ID</th>
                                        <th className="py-2 px-4 border-b text-left">Nombre</th>
                                        <th className="py-2 px-4 border-b text-left">Descripción</th>
                                        <th className="py-2 px-4 border-b text-center">Seleccionar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredObligaciones.map(obligacion => (
                                        <tr key={obligacion.id} className="hover:bg-gray-50">
                                            <td className="py-2 px-4 border-b">{obligacion.id}</td>
                                            <td className="py-2 px-4 border-b">{obligacion.nombre}</td>
                                            <td className="py-2 px-4 border-b">{obligacion.descripcion}</td>
                                            <td className="py-2 px-4 border-b text-center">
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                                    checked={obligacionesSeleccionadas.includes(obligacion.id)}
                                                    onChange={() => toggleObligacionSeleccionada(obligacion.id)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {obligaciones.length === 0 && !loadingObligaciones && <p className="text-gray-500 mt-2">No hay obligaciones disponibles.</p>}
                        </div>
                    )}

                    {obligaciones.length > 0 && clienteSeleccionado && (
                        <div className="mt-4">
                            <button
                                onClick={handleAsignarObligaciones}
                                className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                <Plus className="inline-block mr-2" size={16} />
                                Asignar Obligaciones
                            </button>
                        </div>
                    )}
                </div>
            )}


            {mensaje && <p className={`mt-4 font-semibold ${mensaje.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{mensaje}</p>}
        </div>
    );
};

export default AsignarObligaciones;