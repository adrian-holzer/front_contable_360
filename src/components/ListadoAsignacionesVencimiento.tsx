import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale'; // Importar locale para español
import { API_BASE_URL } from '../config/config';

interface AsignacionVencimiento {
    idAsignacionVencimiento: number;
    asignacion: {
        idAsignacion: number;
        observacion: string;
        cliente: {
            idCliente: number;
            nombre: string;
            cuit: string;
            usuarioResponsable: {
                idUsuario: number;
                nombreUsuario: string;
                nombreApellido: string;
            } | null;
        };
        obligacion: {
            id: number;
            nombre: string;
        };
        activo: boolean;
    };
    vencimiento: {
        fechaVencimiento: string;
    };
    estado: string;
    fechaFinalizacion: string | null;
    observacion: string | null;
}

interface Contacto {
    idContacto: number;
    nombre: string;
    correo: string;
    numTelefono: string;
    cliente: {
        idCliente: number;
        nombre: string;
        cuit: string;
    };
}

const ListadoAsignacionesVencimiento: React.FC = () => {
    const [asignaciones, setAsignaciones] = useState<AsignacionVencimiento[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filtroCuit, setFiltroCuit] = useState<string | null>(null);
    const [filtroFecha, setFiltroFecha] = useState<string | null>(null);
    const [filtroEstado, setFiltroEstado] = useState<string | null>(null);
    const [filtroUsuario, setFiltroUsuario] = useState<number | null>(null);

    // Estado para el modal de finalización
    const [modalOpen, setModalOpen] = useState(false);
    const [asignacionVencimientoId, setAsignacionVencimientoId] = useState<number | null>(null);
    const [contactos, setContactos] = useState<Contacto[]>([]);
    const [contactoSeleccionado, setContactoSeleccionado] = useState<number | null>(null);
    const [observacion, setObservacion] = useState('');
    const [archivos, setArchivos] = useState<File[]>([]);
    const [finalizando, setFinalizando] = useState(false); // Para el estado de carga del modal
    const [idClienteParaModal, setIdClienteParaModal] = useState<number | null>(null);


    const fetchAsignacionesVencimiento = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<AsignacionVencimiento[]>(`${API_BASE_URL}/api/asignaciones-vencimientos`);
            setAsignaciones(response.data);
        } catch (error: any) {
            console.error("Error fetching asignaciones:", error);
            setError("Error al cargar las asignaciones de vencimiento.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAsignacionesVencimiento();
    }, [fetchAsignacionesVencimiento]);

    const getColorEstado = (estado: string, fechaVencimiento: string): string => {
        let fechaVencimientoDate = null;
        if (fechaVencimiento) {
            fechaVencimientoDate = parseISO(fechaVencimiento);
        }
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (estado === 'PENDIENTE') {
            if (fechaVencimientoDate && fechaVencimientoDate < hoy) {
                return 'text-red-500 bg-red-100/50';
            }
            return 'text-yellow-500 bg-yellow-100/50';
        }
        return 'text-green-500 bg-green-100/50';
    };

    // Función para abrir el modal de finalización
    const abrirModalFinalizar = async (idAsignacionVencimiento: number, idCliente: number) => {
        setAsignacionVencimientoId(idAsignacionVencimiento);
        setIdClienteParaModal(idCliente); // Guardar el ID del cliente
        setModalOpen(true);
        setLoading(true);
        try {
            // Obtener los contactos del cliente
            const response = await axios.get<Contacto[]>(`${API_BASE_URL}/api/contactos/cliente/${idCliente}`);

            console.log(response.data);
            setContactos(response.data);
        } catch (error: any) {
            console.error("Error fetching contactos:", error);
            setError("Error al cargar los contactos del cliente.");
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar la finalización de la asignación
    const handleFinalizarAsignacion = async () => {
        if (!asignacionVencimientoId || !contactoSeleccionado || !observacion) {
            setError("Debe seleccionar un contacto y proporcionar una observación.");
            return;
        }

        setFinalizando(true); // Establecer el estado de "finalizando"
        setError(null);
        try {
            // 1. Actualizar el estado de la asignación a "FINALIZADO" y agregar la observación
            const updateResponse = await axios.put(
                `${API_BASE_URL}/api/asignaciones-vencimientos/${asignacionVencimientoId}`,
                {
                    estado: 'FINALIZADO',
                    observacion: observacion,
                }
            );

            if (updateResponse.status !== 200) {
                throw new Error("No se pudo actualizar el estado de la asignación.");
            }

            // 2. Enviar la notificación por correo electrónico (incluyendo archivos)
            const formData = new FormData();
            formData.append('idAsignacionVencimiento', asignacionVencimientoId.toString());
            formData.append('idContactoDestinatario', contactoSeleccionado.toString());
            formData.append('observacion', observacion);
            archivos.forEach((archivo) => {
                formData.append('archivosAdjuntos', archivo);
            });

            const notificationResponse = await axios.post(
                `${API_BASE_URL}/api/asignaciones-vencimientos/enviar-notificacion`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data', // Importante para enviar archivos
                    },
                }
            );

            if (notificationResponse.status !== 200) {
                throw new Error("No se pudo enviar la notificación.");
            }

            // Actualizar el estado de la asignación en la lista localmente
            setAsignaciones((prevAsignaciones) =>
                prevAsignaciones.map((asignacion) =>
                    asignacion.idAsignacionVencimiento === asignacionVencimientoId
                        ? { ...asignacion, estado: 'FINALIZADO', fechaFinalizacion: new Date().toISOString() }
                        : asignacion
                )
            );

            // Cerrar el modal y resetear el estado del modal
            setModalOpen(false);
            setContactoSeleccionado(null);
            setObservacion('');
            setArchivos([]);
            setIdClienteParaModal(null);
        } catch (error: any) {
            console.error("Error al finalizar la asignación:", error);
            setError("Error al finalizar la asignación: " + error.message);
        } finally {
            setFinalizando(false); // Restablecer el estado de "finalizando"
        }
    };

    // Función para manejar la selección de archivos
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setArchivos(Array.from(e.target.files));
        }
    };

    // Filtrar las asignaciones basadas en los filtros seleccionados
    const asignacionesFiltradas = asignaciones.filter(asignacion => {
        let cumpleFiltroCuit = true;
        let cumpleFiltroFecha = true;
        let cumpleFiltroEstado = true;
        let cumpleFiltroUsuario = true;

        if (filtroCuit) {
            cumpleFiltroCuit = asignacion.asignacion.cliente.cuit.toString().startsWith(filtroCuit.toString());
        }
        if (filtroFecha) {
            const fechaFiltroDate = parseISO(filtroFecha);
            const fechaVencimientoDate = asignacion.vencimiento.fechaVencimiento ? parseISO(asignacion.vencimiento.fechaVencimiento) : null;
            cumpleFiltroFecha = fechaVencimientoDate ? format(fechaVencimientoDate, 'yyyy-MM-dd') === format(fechaFiltroDate, 'yyyy-MM-dd') : false;
        }
        if (filtroEstado) {
            cumpleFiltroEstado = asignacion.estado === filtroEstado;
        }
        if (filtroUsuario) {
            cumpleFiltroUsuario = asignacion.asignacion.cliente.usuarioResponsable?.idUsuario === filtroUsuario;
        }

        return cumpleFiltroCuit && cumpleFiltroFecha && cumpleFiltroEstado && cumpleFiltroUsuario;
    });

    // Obtener todos los usuarios únicos para el filtro de usuarios
    const usuariosUnicos = [...new Set(asignaciones.map(a => a.asignacion.cliente.usuarioResponsable?.idUsuario).filter(id => id !== undefined && id !== null))];


    if (loading) {
        return <div className="p-4">Cargando asignaciones...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">Listado de Asignaciones de Vencimiento</h2>

            {/* Filtros */}
            <div className="mb-4 flex flex-wrap gap-4 items-end">
                <div>
                    <label htmlFor="filtro-cuit" className="block text-sm font-medium text-gray-700">Filtrar por CUIT</label>
                    <input
                        type="text"
                        id="filtro-cuit"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={filtroCuit || ''}
                        onChange={(e) => setFiltroCuit(e.target.value || null)}
                    />
                </div>
                <div>
                    <label htmlFor="filtro-fecha" className="block text-sm font-medium text-gray-700">Filtrar por Fecha</label>
                    <input
                        type="date"
                        id="filtro-fecha"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={filtroFecha || ''}
                        onChange={(e) => setFiltroFecha(e.target.value || null)}
                    />
                </div>
                <div>
                    <label htmlFor="filtro-estado" className="block text-sm font-medium text-gray-700">Filtrar por Estado</label>
                    <select
                        id="filtro-estado"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={filtroEstado || ''}
                        onChange={(e) => setFiltroEstado(e.target.value || null)}
                    >
                        <option value="">Todos los Estados</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="FINALIZADO">Finalizado</option>
                        {/* Agrega más opciones de estado si es necesario */}
                    </select>
                </div>
                <div>
                    <label htmlFor="filtro-usuario" className="block text-sm font-medium text-gray-700">Filtrar por Usuario</label>
                    <select
                        id="filtro-usuario"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={filtroUsuario === null ? '' : filtroUsuario}
                        onChange={(e) => setFiltroUsuario(e.target.value ? parseInt(e.target.value, 10) : null)}
                    >
                        <option value="">Todos los Usuarios</option>
                        {usuariosUnicos.map(idUsuario => {
                            const usuario = asignaciones.find(a => a.asignacion.cliente.usuarioResponsable?.idUsuario === idUsuario)?.asignacion.cliente.usuarioResponsable;
                            return (
                                <option key={idUsuario} value={idUsuario}>
                                    {usuario ? `${usuario.nombreUsuario} - ${usuario.nombreApellido}` : 'N/A'}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <button
                    onClick={() => {
                        setFiltroCuit(null);
                        setFiltroFecha(null);
                        setFiltroEstado(null);
                        setFiltroUsuario(null);

                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Limpiar Filtros
                </button>
            </div>

            {asignacionesFiltradas.length === 0 ? (
                <div className="p-4 text-gray-500">No hay asignaciones de vencimiento disponibles.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-md">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 border-b text-left">Obligación</th>
                                <th className="py-2 px-4 border-b text-left">Cliente</th>
                                <th className="py-2 px-4 border-b text-left">CUIT</th>
                                <th className="py-2 px-4 border-b text-left">Responsable</th>
                                <th className="py-2 px-4 border-b text-left">Fecha de Vencimiento</th>
                                <th className="py-2 px-4 border-b text-left">Estado</th>
                                <th className="py-2 px-4 border-b text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {asignacionesFiltradas.map((asignacion) => (
                                <tr key={asignacion.idAsignacionVencimiento} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">{asignacion.asignacion.obligacion.nombre}</td>
                                    <td className="py-2 px-4 border-b">{asignacion.asignacion.cliente.nombre}</td>
                                    <td className="py-2 px-4 border-b">{asignacion.asignacion.cliente.cuit}</td>
                                    <td className="py-2 px-4 border-b">
                                        {asignacion.asignacion.cliente.usuarioResponsable
                                            ? asignacion.asignacion.cliente.usuarioResponsable.nombreApellido
                                            : 'Sin Asignar'}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {asignacion.vencimiento.fechaVencimiento
                                            ? format(parseISO(asignacion.vencimiento.fechaVencimiento), 'dd/MM/yyyy', { locale: es })
                                            : 'Sin Fecha'}
                                    </td>
                                    <td className={`py-2 px-4 border-b font-semibold ${getColorEstado(asignacion.estado, asignacion.vencimiento.fechaVencimiento)}`}>
                                        {asignacion.estado}
                                    </td>
                                    <td className="py-2 px-4 border-b">

                                        <button
                                            onClick={() => abrirModalFinalizar(asignacion.idAsignacionVencimiento, asignacion.asignacion.cliente.idCliente)} // Pasar idCliente
                                            disabled={asignacion.estado === 'FINALIZADO'}
                                            className={asignacion.estado === 'FINALIZADO' ? 'text-gray-400 cursor-not-allowed' : 'inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'}

                                        >
                                            Finalizar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Finalización */}
            {modalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Fondo del modal */}
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                        {/* Contenido del modal */}
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left sm:w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            Finalizar Asignación
                                        </h3>
                                        <div className="mt-2 w-full">
                                            <p className="text-sm text-gray-500">
                                                Ingrese los detalles para finalizar la asignación.
                                            </p>
                                        </div>
                                        {loading && <div>Cargando...</div>}
                                        {!loading && (
                                            <div className="mt-4 w-full space-y-4">
                                                <div>
                                                    <label htmlFor="contacto" className="block text-sm font-medium text-gray-700">
                                                        Contacto <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        id="contacto"
                                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                        value={contactoSeleccionado === null ? '' : contactoSeleccionado.toString()}
                                                        onChange={(e) => setContactoSeleccionado(parseInt(e.target.value, 10))}
                                                        disabled={loading}
                                                    >
                                                        <option value="">Seleccione un contacto</option>
                                                        {
                                                        contactos.map((contacto) => (
                                                            <option key={contacto.idContacto} value={contacto.idContacto.toString()}>
                                                                {contacto.nombre} ({contacto.correo})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="observacion" className="block text-sm font-medium text-gray-700">
                                                        Observación <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        id="observacion"
                                                        value={observacion}
                                                        onChange={(e) => setObservacion(e.target.value)}
                                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                        placeholder="Ingrese una observación"
                                                        disabled={loading}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="archivos" className="block text-sm font-medium text-gray-700">
                                                        Archivos
                                                    </label>
                                                    <input
                                                        type="file"
                                                        id="archivos"
                                                        multiple
                                                        onChange={handleFileChange}
                                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                        disabled={loading}
                                                    />
                                                </div>
                                                {archivos.length > 0 && (
                                                    <div className="w-full">
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Archivos Adjuntos:
                                                        </label>
                                                        <div className="mt-1 space-y-1">
                                                            {archivos.map((archivo, index) => (
                                                                <div key={index} className="flex items-center gap-2">
                                                                    <span>Archivo:</span>
                                                                    <span className="text-sm text-gray-700 truncate max-w-[200px]">{archivo.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="submit"
                                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200
                                        ${finalizando ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                    onClick={handleFinalizarAsignacion}
                                    disabled={finalizando || !contactoSeleccionado || !observacion}

                                >
                                    {finalizando ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Finalizando...
                                        </>
                                    ) : (
                                        "Finalizar"
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => {
                                        setModalOpen(false);
                                        setContactoSeleccionado(null);
                                        setObservacion('');
                                        setArchivos([]);
                                        setIdClienteParaModal(null);
                                    }}
                                    disabled={finalizando}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListadoAsignacionesVencimiento;
