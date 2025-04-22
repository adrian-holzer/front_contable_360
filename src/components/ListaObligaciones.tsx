import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Eye, Plus, X, Search } from 'lucide-react'; // Importa el icono de Search
import { API_BASE_URL } from '../config/config';
import CargarExcel from './CargarExcel';
import NuevaObligacion from './NuevaObligacion'; // Importa NuevaObligacion

interface VencimientoData {
  id: number;
  obligacion: {
    id: number;
    nombre: string;
    descripcion: string | null;
    observaciones: string | null;
  };
  terminacionCuit: number;
  mes: number;
  dia: number;
  observaciones: string | null;
}

interface Obligacion {
  id: number;
  nombre: string;
}

const ListaObligaciones: React.FC = () => {
  const [obligaciones, setObligaciones] = useState<Obligacion[]>([]);
  const [loadingObligaciones, setLoadingObligaciones] = useState<boolean>(true);
  const [errorObligaciones, setErrorObligaciones] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedObligacionId, setSelectedObligacionId] = useState<number | null>(null);
  const [vencimientosData, setVencimientosData] = useState<VencimientoData[]>([]);
  const [loadingVencimientos, setLoadingVencimientos] = useState<boolean>(false);
  const [errorVencimientos, setErrorVencimientos] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null); // 'success' | 'error' | null
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // Estado para el término de búsqueda
  const [filteredObligaciones, setFilteredObligaciones] = useState<Obligacion[]>([]);

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
    ;
  }, []);

  const handleCrearNuevaObligacionClick = () => {
    // Lógica para crear una nueva obligación (puedes usar navigate('/nueva-obligacion'))
  };

  useEffect(() => {
    fetchObligaciones();
  }, [fetchObligaciones]);

  useEffect(() => {
    // Filtra las obligaciones cada vez que cambia el searchTerm o las obligaciones
    const results = obligaciones.filter(obligacion =>
      obligacion.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredObligaciones(results);
  }, [searchTerm, obligaciones]);

  const handleUploadSuccess = () => {
    setUploadStatus('success');
    setUploadMessage('Archivo Excel cargado y procesado exitosamente.');
    fetchObligaciones();
    setTimeout(() => {
      setUploadStatus(null);
      setUploadMessage(null);
    }, 3000); // Ocultar el mensaje después de 3 segundos
  };

  const handleUploadError = (error: string) => {
    setUploadStatus('error');
    setUploadMessage(`Error al cargar el archivo Excel: ${error}`);
    setTimeout(() => {
      setUploadStatus(null);
      setUploadMessage(null);
    }, 5000); // Ocultar el mensaje después de 5 segundos
  };

  const handleVerVencimientos = (obligacionId: number, obligacionNombre: string) => {
    setSelectedObligacionId(obligacionId);
    setLoadingVencimientos(true);
    setErrorVencimientos(null);
    setIsModalOpen(true);

    const fetchVencimientos = async () => {
      try {
        const response = await axios.get<VencimientoData[]>(`${API_BASE_URL}/api/obligaciones/${obligacionId}/vencimientos`);
        setVencimientosData(response.data);
      } catch (error: any) {
        console.error(`Error fetching vencimientos para obligación ${obligacionNombre} (ID: ${obligacionId}):`, error);
        setErrorVencimientos(`Error al cargar los vencimientos para ${obligacionNombre}.`);
      } finally {
        setLoadingVencimientos(false);
      }
    };

    fetchVencimientos();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedObligacionId(null);
    setVencimientosData([]);
    setErrorVencimientos(null);
  };

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const terminacionesCuit = Array.from({ length: 10 }, (_, i) => i);

  const formatVencimientosParaTabla = () => {
    const tabla: { [mes: number]: { [cuit: number]: number | null } } = {};
    meses.forEach((_, index) => {
      tabla[index + 1] = {};
      terminacionesCuit.forEach(cuit => {
        tabla[index + 1][cuit] = null;
      });
    });

    vencimientosData.forEach(vencimiento => {
      if (tabla[vencimiento.mes] && tabla[vencimiento.mes][vencimiento.terminacionCuit] !== null) {
        console.warn(`Conflicto de vencimiento para Mes ${vencimiento.mes}, CUIT ${vencimiento.terminacionCuit}.`);
      }
      if (tabla[vencimiento.mes]) {
        tabla[vencimiento.mes][vencimiento.terminacionCuit] = vencimiento.dia;
      }
    });

    return tabla;
  };

  const vencimientosTabla = formatVencimientosParaTabla();

  if (loadingObligaciones) {
    return <p>Cargando obligaciones...</p>;
  }

  if (errorObligaciones) {
    return <p className="text-red-500">{errorObligaciones}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <CargarExcel onUploadSuccess={handleUploadSuccess} onUploadError={handleUploadError} />

      {uploadStatus && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg text-white ${uploadStatus === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
        >
          {uploadMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        
        <div className="relative rounded-md shadow-sm my-5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="text-gray-400" size={16} />
          </div>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Buscar obligaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          onClick={handleCrearNuevaObligacionClick}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          <Plus className="inline-block mr-2" size={16} />
         Nueva
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4">Listado de Obligaciones</h2>
      <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">ID</th>
            <th className="py-2 px-4 border-b text-left">Nombre</th>
            <th className="py-2 px-4 border-b text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredObligaciones.map(obligacion => (
            <tr key={obligacion.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{obligacion.id}</td>
              <td className="py-2 px-4 border-b">{obligacion.nombre}</td>
              <td className="py-2 px-4 border-b text-center">
                <button
                  onClick={() => handleVerVencimientos(obligacion.id, obligacion.nombre)}
                  className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  <Eye className="inline-block mr-2" size={16} />
                  Vencimientos
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && selectedObligacionId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Vencimientos</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            {loadingVencimientos ? (
              <p>Cargando vencimientos...</p>
            ) : errorVencimientos ? (
              <p className="text-red-500">{errorVencimientos}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Mes</th>
                      {terminacionesCuit.map(cuit => (
                        <th key={cuit} className="py-2 px-4 border-b text-center">
                          CUIT Termina en {cuit}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {meses.map((mes, index) => (
                      <tr key={index}>
                        <td className="py-2 px-4 border-b">{mes}</td>
                        {terminacionesCuit.map(cuit => (
                          <td key={cuit} className="py-2 px-4 border-b text-center">
                            {vencimientosTabla[index + 1]?.[cuit] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaObligaciones;