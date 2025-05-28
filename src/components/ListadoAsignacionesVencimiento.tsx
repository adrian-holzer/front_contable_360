import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { API_BASE_URL } from '../config/config';
import { useNotifications } from '../context/NotificationContext';

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
    usuarioFinalizo: {
        idUsuario: number;
        nombreApellido: string;
    };
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
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);

    // Estado para el modal de finalización
    const [modalOpen, setModalOpen] = useState(false);
    const [asignacionVencimientoId, setAsignacionVencimientoId] = useState<number | null>(null);
    const [contactos, setContactos] = useState<Contacto[]>([]);
    const [contactoSeleccionado, setContactoSeleccionado] = useState<number | null>(null);
    const [observacion, setObservacion] = useState('');
    const [archivos, setArchivos] = useState<File[]>([]);
    const [finalizando, setFinalizando] = useState(false); // Para el estado de carga del modal
    const [idClienteParaModal, setIdClienteParaModal] = useState<number | null>(null);
    const [filtroNombreCliente, setFiltroNombreCliente] = useState<string | null>(null); // MODIFICACIÓN
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(''); // Para manejar el valor seleccionado
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Cantidad de items por página

    const { fetchNotifications } = useNotifications(); // Usar el hook de notificaciones















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

    const getEstadoDisplayInfo = (estado: string, fechaVencimiento: string): { text: string; className: string } => {
        let fechaVencimientoDate = null;
        if (fechaVencimiento) {
            fechaVencimientoDate = parseISO(fechaVencimiento);
        }
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (estado === 'PENDIENTE') {
            if (fechaVencimientoDate && fechaVencimientoDate < hoy) {
                return { text: 'VENCIDO', className: 'text-red-500 bg-red-100/50' }; // Aquí se cambia el texto a 'VENCIDO'
            }
            return { text: 'PENDIENTE', className: 'text-yellow-500 bg-yellow-100/50' };
        }
        // Para otros estados como 'FINALIZADO', mantén el texto original de la base de datos
        return { text: estado, className: 'text-green-500 bg-green-100/50' };
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

            setContactos(response.data);
        } catch (error: any) {
            console.error("Error fetching contactos:", error);
            setError("Error al cargar los contactos del cliente.");
        } finally {
            setLoading(false);
        }
    };
    // Función para quitar un archivo de la lista
    const handleRemoveArchivo = (indexToRemove: number) => {
        setArchivos(prevArchivos => prevArchivos.filter((_, index) => index !== indexToRemove));
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
            else {

                fetchAsignacionesVencimiento()
                fetchNotifications()

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

    // Función para manejar la selección de archivos (modificada para acumular)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const nuevosArchivosSeleccionados = Array.from(e.target.files);
            setArchivos(prevArchivos => {
                // Opcional: Filtrar para evitar duplicados basados en nombre y tamaño
                const archivosParaAgregar = nuevosArchivosSeleccionados.filter(nuevo =>
                    !prevArchivos.some(existente =>
                        existente.name === nuevo.name &&
                        existente.size === nuevo.size &&
                        existente.lastModified === nuevo.lastModified // Criterio más robusto
                    )
                );
                return [...prevArchivos, ...archivosParaAgregar];
            });
            // Resetear el valor del input para permitir seleccionar el mismo archivo
            // si se quitó y se quiere volver a agregar, o agregar más archivos.
            e.target.value = '';
        }
    };

    // Filtrar las asignaciones basadas en los filtros seleccionados
    const asignacionesFiltradas = asignaciones.filter(asignacion => {
        let cumpleFiltroCuit = true;
        let cumpleFiltroFecha = true;
        let cumpleFiltroEstado = true;
        let cumpleFiltroUsuario = true;
        let cumpleFiltroNombreCliente = true; // MODIFICACIÓN


        if (filtroCuit) {
            cumpleFiltroCuit = asignacion.asignacion.cliente.cuit.toString().startsWith(filtroCuit.toString());
        }
        if (filtroFecha) {
            const fechaFiltroDate = parseISO(filtroFecha);
            const fechaVencimientoDate = asignacion.vencimiento.fechaVencimiento ? parseISO(asignacion.vencimiento.fechaVencimiento) : null;
            cumpleFiltroFecha = fechaVencimientoDate ? format(fechaVencimientoDate, 'yyyy-MM-dd') === format(fechaFiltroDate, 'yyyy-MM-dd') : false;
        }
      if (filtroEstado) {
            if (filtroEstado === 'VENCIDO') {
                const fechaVencimientoDate = asignacion.vencimiento.fechaVencimiento ? parseISO(asignacion.vencimiento.fechaVencimiento) : null;
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);

                cumpleFiltroEstado = asignacion.estado === 'PENDIENTE' && fechaVencimientoDate && fechaVencimientoDate < hoy;
            } else if (filtroEstado === 'PENDIENTE') { // <-- Modificación clave aquí
                const fechaVencimientoDate = asignacion.vencimiento.fechaVencimiento ? parseISO(asignacion.vencimiento.fechaVencimiento) : null;
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);

                // Para 'PENDIENTE', debe ser estado 'PENDIENTE' Y NO debe estar vencida
                cumpleFiltroEstado = asignacion.estado === 'PENDIENTE' && (!fechaVencimientoDate || fechaVencimientoDate >= hoy);
            }
            else {
                // Para los demás filtros (FINALIZADO, etc.), se compara directamente con el estado de la BD.
                cumpleFiltroEstado = asignacion.estado === filtroEstado;
            }
        }
        if (filtroUsuario) {
            if (asignacion.estado === 'FINALIZADO') {
                cumpleFiltroUsuario = asignacion.usuarioFinalizo?.idUsuario === filtroUsuario;
            } else { // Si no es FINALIZADO (es PENDIENTE u otro estado)
                cumpleFiltroUsuario = asignacion.asignacion.cliente.usuarioResponsable?.idUsuario === filtroUsuario;
            }
        }
        // Nueva condición para filtrar por nombre de cliente
        if (filtroNombreCliente) { // MODIFICACIÓN
            cumpleFiltroNombreCliente = asignacion.asignacion.cliente.nombre.toLowerCase().includes(filtroNombreCliente.toLowerCase()); // MODIFICACIÓN
        }
        return cumpleFiltroCuit && cumpleFiltroFecha && cumpleFiltroEstado && cumpleFiltroUsuario && cumpleFiltroNombreCliente;
    });

    // Obtener todos los usuarios únicos para el filtro de usuarios
    //const usuariosUnicos = [...new Set(asignaciones.map(a => a.asignacion.cliente.usuarioResponsable?.idUsuario).filter(id => id !== undefined && id !== null))];


    // Obtener todos los usuarios únicos para el filtro de usuarios
    const usuariosUnicos = Array.from(new Set(
        asignaciones.flatMap(a => {
            const userIds = [];
            if (a.asignacion.cliente.usuarioResponsable?.idUsuario) {
                userIds.push(a.asignacion.cliente.usuarioResponsable.idUsuario);
            }
            if (a.estado === 'FINALIZADO' && a.usuarioFinalizo?.idUsuario) {
                userIds.push(a.usuarioFinalizo.idUsuario);
            }
            return userIds;
        }).filter(id => id !== undefined && id !== null)
    ));













    // Lógica para la paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = asignacionesFiltradas.slice(indexOfFirstItem, indexOfLastItem);

    console.log(currentItems)
    // Cambiar de página
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    if (loading) {
        return <div className="p-4">Cargando asignaciones...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="p-4">

            {/* Filtros */}
            <div className="mb-4 flex flex-wrap gap-4 items-end">
                <div>
                    <label htmlFor="filtro-nombre-cliente" className="block text-sm font-medium text-gray-700">Filtrar por Cliente</label>
                    <input
                        type="text"
                        id="filtro-nombre-cliente"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={filtroNombreCliente || ''}
                        onChange={(e) => setFiltroNombreCliente(e.target.value || null)}
                    />
                </div> {/* MODIFICACIÓN */}
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
                        <option value="VENCIDO">Vencido</option> {/* AÑADE ESTA LÍNEA */}

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
                            // Intentamos encontrar al usuario responsable
                            let usuarioParaMostrar = asignaciones.find(a => a.asignacion.cliente.usuarioResponsable?.idUsuario === idUsuario)?.asignacion.cliente.usuarioResponsable;

                            // Si no es un responsable o si este idUsuario es de un usuario finalizador, buscamos al finalizador
                            if (!usuarioParaMostrar) {
                                const asignacionFinalizada = asignaciones.find(a => a.estado === 'FINALIZADO' && a.usuarioFinalizo?.idUsuario === idUsuario);
                                if (asignacionFinalizada) {
                                    // Creamos un objeto con la estructura similar para mostrar
                                    usuarioParaMostrar = {
                                        idUsuario: asignacionFinalizada.usuarioFinalizo.idUsuario,
                                        nombreUsuario: '', // No tienen nombreUsuario en la interfaz
                                        nombreApellido: asignacionFinalizada.usuarioFinalizo.nombreApellido
                                    };
                                }
                            }

                            return (
                                <option key={idUsuario} value={idUsuario}>
                                    {usuarioParaMostrar ?
                                        (usuarioParaMostrar.nombreUsuario ?
                                            `${usuarioParaMostrar.nombreApellido}` :
                                            `${usuarioParaMostrar.nombreApellido}`) // Etiquetar claramente los finalizadores
                                        : 'Usuario Desconocido'}
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
                        setFiltroNombreCliente(null);

                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Limpiar Filtros
                </button>
            </div>

            {currentItems.length === 0 && !loading ? (
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
                            {currentItems.map((asignacion) => (
                                <tr key={asignacion.idAsignacionVencimiento} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">{asignacion.asignacion.obligacion.nombre}</td>
                                    <td className="py-2 px-4 border-b">{asignacion.asignacion.cliente.nombre}</td>
                                    <td className="py-2 px-4 border-b">{asignacion.asignacion.cliente.cuit}</td>
                                    <td className="py-2 px-4 border-b">
                                        {
                                            asignacion.estado === 'FINALIZADO'
                                                ? (asignacion.usuarioFinalizo?.nombreApellido || 'No Asignado') // Muestra nombre si está finalizado y existe usuario, sino 'No disponible'
                                                : (asignacion.asignacion?.cliente?.usuarioResponsable?.nombreApellido || 'No asignado') // Muestra responsable del cliente si no está finalizado
                                        }
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {asignacion.vencimiento.fechaVencimiento
                                            ? format(parseISO(asignacion.vencimiento.fechaVencimiento), 'dd/MM/yyyy', { locale: es })
                                            : 'Sin Fecha'}
                                    </td>
                                    <td className={`py-2 px-4 border-b font-semibold ${getEstadoDisplayInfo(asignacion.estado, asignacion.vencimiento.fechaVencimiento).className}`}>
                                        {getEstadoDisplayInfo(asignacion.estado, asignacion.vencimiento.fechaVencimiento).text}
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

            {/* Paginación */}
            {asignacionesFiltradas.length > itemsPerPage && (
                <div className="flex justify-center mt-4">
                    {Array.from({ length: Math.ceil(asignacionesFiltradas.length / itemsPerPage) }, (_, i) => i + 1).map(pageNumber => (
                        <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`mx-1 px-3 py-1 rounded ${currentPage === pageNumber ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            {pageNumber}
                        </button>
                    ))}
                </div>
            )}

            {/* Modal de Finalización */}
            {/* Modal de Finalización */}
            {/* Modal de Finalización */}
            {modalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

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

                                        {/* Estado de carga de contactos */}
                                        {loading && <div className="mt-4 text-center">Cargando datos del contacto...</div>}

                                        {/* Formulario del modal (se muestra cuando no está cargando contactos) */}
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
                                                        disabled={finalizando}
                                                    >
                                                        <option value="">Seleccione un contacto</option>
                                                        {contactos.map((contacto) => (
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
                                                        rows={3}
                                                        className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                        placeholder="Ingrese una observación"
                                                        disabled={finalizando}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="archivos" className="block text-sm font-medium text-gray-700">
                                                        Adjuntar Archivos
                                                    </label>
                                                    <input
                                                        type="file"
                                                        id="archivos"
                                                        multiple
                                                        onChange={handleFileChange}
                                                        className="mt-1 block w-full text-sm text-slate-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-md file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-indigo-50 file:text-indigo-700
                                                hover:file:bg-indigo-100"
                                                        disabled={finalizando}
                                                    />
                                                </div>

                                                {/* Lista de archivos adjuntos */}
                                                {archivos.length > 0 && (
                                                    <div className="w-full">
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Archivos Adjuntos ({archivos.length}):
                                                        </label>
                                                        <div className="mt-1 space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
                                                            {archivos.map((archivo, index) => (
                                                                <div
                                                                    key={index + '-' + archivo.name + '-' + archivo.lastModified} // Clave más única
                                                                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm"
                                                                >
                                                                    <span className="text-gray-700 truncate" title={archivo.name}>
                                                                        {archivo.name} ({(archivo.size / 1024).toFixed(1)} KB)
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveArchivo(index)}
                                                                        className="ml-2 text-red-500 hover:text-red-700 font-medium"
                                                                        aria-label={`Quitar ${archivo.name}`}
                                                                        disabled={finalizando}
                                                                    >
                                                                        Quitar
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {error && <div className="mt-3 text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200
                            ${finalizando || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                    onClick={handleFinalizarAsignacion}
                                    disabled={finalizando || loading || !contactoSeleccionado || !observacion.trim()}
                                >
                                    {finalizando ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => {
                                        setModalOpen(false);
                                        setContactoSeleccionado(null);
                                        setObservacion('');
                                        setArchivos([]);
                                        setIdClienteParaModal(null);
                                        setError(null); // Limpiar errores del modal
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
