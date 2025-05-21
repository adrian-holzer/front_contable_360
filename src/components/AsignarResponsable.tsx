import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, User, Users, CheckCircle, XCircle, Search } from 'lucide-react';
import { API_BASE_URL } from '../config/config';

interface Usuario {
    idUsuario: number; // Cambiado de id a idUsuario
    cuit: string;
    nombreUsuario: string;    // Cambiado de username a nombreUsuario
    nombreApellido: string;
    correo: string;
    // ... otras propiedades del usuario
}

interface Cliente {
    idCliente: number;
    nombre?: string;
    razonSocial?: string;
    cuit: string;
    usuarioResponsable?: Usuario | null; // El usuario responsable asignado al cliente
}

interface AsignacionResponsable {
    idAsignacion: number;
    observacion: string;
    cliente: { idCliente: number; nombre?: string; razonSocial?: string; }; // Ajustado para obtener nombre
    obligacion: { id: number; nombre: string; descripcion?: string | null; };
    activo: boolean;
}

const AsignarResponsable: React.FC = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loadingUsuarios, setLoadingUsuarios] = useState<boolean>(true);
    const [errorUsuarios, setErrorUsuarios] = useState<string | null>(null);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loadingClientes, setLoadingClientes] = useState<boolean>(true);
    const [errorClientes, setErrorClientes] = useState<string | null>(null);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [modalUsuariosVisible, setModalUsuariosVisible] = useState<boolean>(false);
    const [modalClientesVisible, setModalClientesVisible] = useState<boolean>(false);
    const [asignaciones, setAsignaciones] = useState<AsignacionResponsable[]>([]);
    const [searchTermUsuario, setSearchTermUsuario] = useState<string>('');
    const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
    const [searchTermCliente, setSearchTermCliente] = useState<string>('');
    const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);

    const fetchUsuarios = useCallback(async () => {
        setLoadingUsuarios(true);
        setErrorUsuarios(null);
        try {
            const response = await axios.get<Usuario[]>(`${API_BASE_URL}/api/usuarios`);
            setUsuarios(response.data);
        } catch (error: any) {
            console.error("Error fetching usuarios:", error);
            setErrorUsuarios("Error al cargar los usuarios.");
        } finally {
            setLoadingUsuarios(false);
        }
    }, []);

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

    const fetchAsignaciones = useCallback(async (idCliente: number) => {
        if (!idCliente) return; // No hacer la llamada si no hay cliente seleccionado

        try {
            const response = await axios.get<AsignacionResponsable[]>(`${API_BASE_URL}/api/asignaciones/cliente/${idCliente}`);
            console.log("Respuesta de asignaciones:", response.data);
            setAsignaciones(response.data);
        } catch (error: any) {
            console.error("Error fetching asignaciones del cliente:", error);
            setMensaje("Error al cargar las asignaciones del cliente.");
            setAsignaciones([]); // Asegurar que el estado se resetea en caso de error
        }
    }, []);

    useEffect(() => {
        fetchUsuarios();
        fetchClientes();
    }, [fetchUsuarios, fetchClientes]);

    useEffect(() => {
        if (clienteSeleccionado) {
            fetchAsignaciones(clienteSeleccionado.idCliente);
        }
    }, [clienteSeleccionado, fetchAsignaciones]);

    useEffect(() => {
        const results = usuarios.filter(usuario => {
            // Comprobamos si usuario y usuario.nombreUsuario existen antes de llamar a toLowerCase()
            return usuario && usuario.nombreUsuario && usuario.nombreUsuario.toLowerCase().includes(searchTermUsuario.toLowerCase());
        });
        setFilteredUsuarios(results);
    }, [searchTermUsuario, usuarios]);

    useEffect(() => {
        const results = clientes.filter(cliente =>
            (cliente.nombre?.toLowerCase().includes(searchTermCliente.toLowerCase()) ||
                cliente.razonSocial?.toLowerCase().includes(searchTermCliente.toLowerCase()) ||
                cliente.cuit.includes(searchTermCliente))
        );
        setFilteredClientes(results);
    }, [searchTermCliente, clientes]);

    const handleUsuarioSeleccionado = (usuario: Usuario) => {
        setUsuarioSeleccionado(usuario);
        setModalUsuariosVisible(false);
    };

    const handleClienteSeleccionado = (cliente: Cliente) => {
        setClienteSeleccionado(cliente);
        setModalClientesVisible(false);
        // Fetch asignaciones for the selected client immediately
        fetchAsignaciones(cliente.idCliente);
    };

    const handleAsignarResponsable = async () => {
        if (!usuarioSeleccionado) {
            setMensaje('Por favor, selecciona un usuario responsable.');
            return;
        }
        if (!clienteSeleccionado) {
            setMensaje('Por favor, selecciona un cliente.');
            return;
        }

        try {
            // Lógica para asignar el usuario responsable al cliente
            await axios.post(`${API_BASE_URL}/api/clientes/asignar/${clienteSeleccionado.idCliente}/usuario/${usuarioSeleccionado.idUsuario}`); // Corrección aquí
            setMensaje(`Responsable ${usuarioSeleccionado.nombreUsuario} asignado a ${clienteSeleccionado.nombre || clienteSeleccionado.razonSocial || 'Cliente'}.`); // Corrección aquí
            fetchAsignaciones(clienteSeleccionado.idCliente); // Refresh assignments
            setUsuarioSeleccionado(null);
            setClienteSeleccionado(null);

        } catch (error: any) {
            
            setMensaje("Error : " + error.response.data);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Asignar Responsable de Cliente</h2>

            <div className="mb-4">
                <button
                    onClick={() => setModalUsuariosVisible(true)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    <User className="inline-block mr-2" size={16} />
                    Seleccionar Usuario Responsable
                </button>
                {usuarioSeleccionado && (
                    <div className="mt-2 p-2 border rounded-md bg-blue-100 text-blue-800">
                        Usuario Seleccionado: {usuarioSeleccionado.nombreUsuario} (ID: {usuarioSeleccionado.idUsuario})
                    </div>
                )}
            </div>

            <div className="mb-4">
                <button
                    onClick={() => setModalClientesVisible(true)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    <Users className="inline-block mr-2" size={16} />
                    Seleccionar Cliente
                </button>
                {clienteSeleccionado && (
                    <div className="mt-2 p-2 border rounded-md bg-green-100 text-green-800">
                        Cliente Seleccionado: {clienteSeleccionado.nombre || clienteSeleccionado.razonSocial} (ID: {clienteSeleccionado.idCliente})
                    </div>
                )}
            </div>

            <button
                onClick={handleAsignarResponsable}
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={!usuarioSeleccionado || !clienteSeleccionado}
            >
                <CheckCircle className="inline-block mr-2" size={16} />
                Asignar Responsable
            </button>

            {mensaje && <p className={`mt-4 font-semibold ${mensaje.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{mensaje}</p>}

            {/* Modales para seleccionar Usuario y Cliente */}
            {modalUsuariosVisible && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Seleccionar Usuario</h3>
                            <button onClick={() => setModalUsuariosVisible(false)} className="text-gray-500 hover:text-gray-700">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="relative rounded-md shadow-sm mb-3">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="text-gray-400" size={16} />
                            </div>
                            <input
                                type="text"
                                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Buscar usuario por nombre de usuario..."
                                value={searchTermUsuario}
                                onChange={(e) => setSearchTermUsuario(e.target.value)}
                            />
                        </div>
                        {loadingUsuarios ? (
                            <p>Cargando usuarios...</p>
                        ) : errorUsuarios ? (
                            <p className="text-red-500">{errorUsuarios}</p>
                        ) : (
                            <div className="overflow-y-auto max-h-96">
                                <ul className="divide-y divide-gray-200">
                                    {filteredUsuarios.map(usuario => (
                                        <li key={usuario.idUsuario} className="py-2 px-4 hover:bg-gray-100 cursor-pointer"  
                                            onClick={() => handleUsuarioSeleccionado(usuario)}>
                                            <div className="flex items-center">
                                                <User className="mr-2 text-gray-600" size={16} />
                                                <span className="text-gray-900">{usuario.nombreUsuario} (ID: {usuario.idUsuario})</span>  
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                {filteredUsuarios.length === 0 && !loadingUsuarios && (
                                    <p className="text-gray-500 mt-2">No se encontraron usuarios.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {modalClientesVisible && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Seleccionar Cliente</h3>
                            <button onClick={() => setModalClientesVisible(false)} className="text-gray-500 hover:text-gray-700">
                                <XCircle size={20} />
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
                                <ul className="divide-y divide-gray-200">
                                    {filteredClientes.map(cliente => (
                                        <li key={cliente.idCliente} className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleClienteSeleccionado(cliente)}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Users className="inline-block mr-2 text-gray-600" size={16} />
                                                    <span className="text-gray-900">{cliente.nombre || cliente.razonSocial} (CUIT: {cliente.cuit})</span>
                                                </div>

                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                {filteredClientes.length === 0 && !loadingClientes && (
                                    <p className="text-gray-500 mt-2">No se encontraron clientes.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {clienteSeleccionado && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Listado de Asignaciones para {clienteSeleccionado.nombre || clienteSeleccionado.razonSocial}</h3>
                    {asignaciones.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-md">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-2 px-4 border-b text-left">ID Asignación</th>
                                        <th className="py-2 px-4 border-b text-left">Observación</th>
                                        <th className="py-2 px-4 border-b text-left">Obligación</th>
                                        <th className="py-2 px-4 border-b text-left">Activo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {asignaciones.map((asignacion, index) => (
                                        <tr key={asignacion.idAsignacion} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                            <td className="py-2 px-4 border-b">{asignacion.idAsignacion}</td>
                                            <td className="py-2 px-4 border-b">{asignacion.observacion}</td>
                                            <td className="py-2 px-4 border-b">{asignacion.obligacion.nombre}</td>
                                            <td className="py-2 px-4 border-b">{asignacion.activo ? 'Sí' : 'No'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">No hay asignaciones registradas para este cliente.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AsignarResponsable;
