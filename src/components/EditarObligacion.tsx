import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config/config';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

interface EditarObligacionProps {
  onObligacionUpdated?: () => void;
  onUpdateError?: (error: string) => void;
}

interface VencimientoForm {
  mes: number;
  terminacionCuit: number;
  dia: number | null;
}

interface VencimientoDataFromApi {
  mes: number;
  terminacionCuit: number;
  dia: number;
}

interface ObligacionData {
  id: number;
  nombre: string;
  descripcion: string | null;
  observaciones: string | null;
}

const meses = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

const terminacionesCuit = Array.from({ length: 10 }, (_, i) => i);

const EditarObligacion: React.FC<EditarObligacionProps> = ({ onObligacionUpdated, onUpdateError }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const obligacionId = id ? parseInt(id, 10) : null;

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [vencimientos, setVencimientos] = useState<VencimientoForm[]>(
    meses.flatMap((_, mesIndex) =>
      terminacionesCuit.map(cuit => ({ mes: mesIndex + 1, terminacionCuit: cuit, dia: null }))
    )
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isErrorMessageVisible, setIsErrorMessageVisible] = useState(false);
  const [nombreError, setNombreError] = useState<string | null>(null);
  const [descripcionError, setDescripcionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSuccessMessageVisible, setIsSuccessMessageVisible] = useState(false);
  const [loadingObligacion, setLoadingObligacion] = useState(true);
  const [loadingVencimientos, setLoadingVencimientos] = useState(true);
  const [errorVencimientos, setErrorVencimientos] = useState<string | null>(null);
    const { fetchNotifications } = useNotifications(); // Usar el hook de notificaciones

  const fetchObligacion = useCallback(async () => {
    if (obligacionId) {
      setLoadingObligacion(true);
      setUpdateError(null);
      setIsErrorMessageVisible(false);
      try {
        const response = await axios.get<ObligacionData>(`${API_BASE_URL}/api/obligaciones/${obligacionId}`);
        const data = response.data;
        setNombre(data.nombre);
        setDescripcion(data.descripcion || '');
        setObservaciones(data.observaciones || '');
      } catch (error: any) {
        console.error('Error fetching obligación:', error);
        setUpdateError('Error al cargar los datos de la obligación.');
        setIsErrorMessageVisible(true);
      } finally {
        setLoadingObligacion(false);
      }
    }
  }, [obligacionId]);

  const fetchVencimientos = useCallback(async () => {
    if (obligacionId) {
      setLoadingVencimientos(true);
      setErrorVencimientos(null);
      try {
        const response = await axios.get<VencimientoDataFromApi[]>(`${API_BASE_URL}/api/obligaciones/${obligacionId}/vencimientos`);
        const initialVencimientosForm: VencimientoForm[] = meses.flatMap((_, mesIndex) =>
          terminacionesCuit.map(cuit => ({ mes: mesIndex + 1, terminacionCuit: cuit, dia: null }))
        );
        const populatedVencimientos = initialVencimientosForm.map(v => {
          const matchingVencimiento = response.data.find(
            dv => dv.mes === v.mes && dv.terminacionCuit === v.terminacionCuit
          );
          return { ...v, dia: matchingVencimiento ? matchingVencimiento.dia : null };
        });
        setVencimientos(populatedVencimientos);
      } catch (error: any) {
        console.error('Error fetching vencimientos:', error);
        setErrorVencimientos('Error al cargar los vencimientos de la obligación.');
        setIsErrorMessageVisible(true); // Mostrar el error general
      } finally {
        setLoadingVencimientos(false);
      }
    }
  }, [obligacionId]);

  useEffect(() => {
    fetchObligacion();
    fetchVencimientos();
  }, [fetchObligacion, fetchVencimientos]);

  const handleNombreChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNombre(event.target.value);
    setNombreError(null);
  };

  const handleDescripcionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescripcion(event.target.value);
    setDescripcionError(null);
  };

  const handleObservacionesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservaciones(event.target.value);
  };

  const handleVencimientoDiaChange = (mes: number, terminacionCuit: number, value: string) => {
    let newValue: number | null;
    const cleanedValue = value.replace(/[-+.,\s]/g, ''); // Excluye -, +, ., , y espacios

    if (cleanedValue === "") {
      newValue = null;
    } else {
      const parsedValue = parseInt(cleanedValue, 10);
      if (isNaN(parsedValue)) {
        newValue = null;
      } else if (parsedValue > 31) {
        newValue = 31;
      } else {
        newValue = parsedValue;
      }
    }

    const newVencimientos = vencimientos.map(v =>
      v.mes === mes && v.terminacionCuit === terminacionCuit ? { ...v, dia: newValue } : v
    );
    setVencimientos(newVencimientos);
  };

  const handleVolverListado = () => {
    navigate('/obligaciones');
  };

  const handleCloseSuccessMessage = () => {
    setIsSuccessMessageVisible(false);
    navigate('/obligaciones');
  };

  const handleCloseErrorMessage = () => {
    setIsErrorMessageVisible(false);
  };

  const handleModificarObligacion = async () => {
    setNombreError(null);
    setDescripcionError(null);
    setSuccessMessage(null);
    setIsErrorMessageVisible(false);

    if (!nombre.trim()) {
      setNombreError('El nombre es obligatorio.');
      return;
    }

   /*  if (!descripcion.trim()) {
      setDescripcionError('La descripción es obligatoria.');
      return;
    } */

    setIsUpdating(true);
    setUpdateError(null);

    const vencimientosParaBackend = vencimientos
      .filter(v => v.dia !== null)
      .map(v => ({ mes: v.mes, terminacionCuit: v.terminacionCuit, dia: v.dia }));

    const obligacionData = {
      nombre,
      descripcion,
      observaciones,
      vencimientos: vencimientosParaBackend,
    };

    try {
      if (obligacionId) {
        const response = await axios.put(`${API_BASE_URL}/api/obligaciones/${obligacionId}`, obligacionData);
        setIsUpdating(false);
        setSuccessMessage('Obligación modificada exitosamente.');
        setIsSuccessMessageVisible(true);
        fetchNotifications()
        if (onObligacionUpdated) {
          onObligacionUpdated();
        }
      } else {
        console.error('No se encontró el ID de la obligación para modificar.');
        setUpdateError('No se encontró el ID de la obligación.');
        setIsErrorMessageVisible(true);
        setIsUpdating(false);
      }
    } catch (error: any) {
      console.error('Error al modificar la obligación:', error.response.data);
      setIsUpdating(false);
      setUpdateError(' Error al modificar la obligación. ' + error.response.data);
      setIsErrorMessageVisible(true);
      if (onUpdateError && error.response && error.response.data && error.response.data.message) {
        onUpdateError(error.response.data);
      } else if (onUpdateError) {
        onUpdateError('Error desconocido al modificar la obligación.');
      }
    }
  };

  if (loadingObligacion || loadingVencimientos) {
    return <div>Cargando datos de la obligación y vencimientos...</div>;
  }

  return (
    <div className="relative bg-white shadow-md rounded-md p-4 md:p-6  mx-auto">
      {isSuccessMessageVisible && successMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md z-50 flex items-center justify-between" role="alert">
          <strong className="font-bold">{successMessage}</strong>
          <button onClick={handleCloseSuccessMessage} className="ml-4 focus:outline-none">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {isErrorMessageVisible && (updateError || errorVencimientos) && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md z-50 flex items-center justify-between" role="alert">
          <span className="block sm:inline">{updateError || errorVencimientos}</span>
          <button onClick={handleCloseErrorMessage} className="ml-4 focus:outline-none">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">
          Nombre:
        </label>
        <input
          type="text"
          id="nombre"
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm ${nombreError ? 'border-red-500' : ''}`}
          value={nombre}
          onChange={handleNombreChange}
        />
        {nombreError && <p className="text-red-500 text-xs italic">{nombreError}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="descripcion" className="block text-gray-700 text-sm font-bold mb-2">
          Descripción:
        </label>
        <textarea
          id="descripcion"
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm ${descripcionError ? 'border-red-500' : ''}`}
          value={descripcion}
          onChange={handleDescripcionChange}
        />
        {descripcionError && <p className="text-red-500 text-xs italic">{descripcionError}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="observaciones" className="block text-gray-700 text-sm font-bold mb-2">
          Observaciones:
        </label>
        <textarea
          id="observacion"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
          value={observaciones}
          onChange={handleObservacionesChange}
        />
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-left">Vencimientos por CUIT</h3>
        <div className="overflow-x-auto w-full">
          <table className="border border-gray-200 text-sm table-auto mx-0" style={{ minWidth: '600px' }}>
            <thead>
              <tr>
                <th className="py-2 px-3 border-b text-left w-[120px]">Mes/CUIT</th>
                {terminacionesCuit.map(cuit => (
                  <th key={cuit} className="py-2 px-3 border-b text-center w-[80px]">
                    {cuit}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {meses.map((mes, mesIndex) => (
                <tr key={mesIndex}>
                  <td className="py-2 px-3 border-b">{mes}</td>
                  {terminacionesCuit.map(cuit => (
                    <td key={cuit} className="py-2 px-3 border-b text-center">
                      <div className="mx-auto w-full" style={{ maxWidth: '70px' }}>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          className="shadow appearance-none border rounded w-full py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center text-sm no-spinners"
                          value={vencimientos.find(v => v.mes === mesIndex + 1 && v.terminacionCuit === cuit)?.dia || ''}
                          onChange={(e) => handleVencimientoDiaChange(mesIndex + 1, cuit, e.target.value)}
                          placeholder="D"
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between w-full mt-4">
        <button
          onClick={handleVolverListado}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm w-full sm:w-auto max-w-[120px] mr-2"
        >
          <ArrowLeft className="mr-1 sm:mr-2" size={14} /> Volver
        </button>
        <button
          onClick={handleModificarObligacion}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm w-full sm:w-auto max-w-[120px]"
          disabled={isUpdating || loadingObligacion || loadingVencimientos}
        >
          {isUpdating ? 'Guardando...' : (
            <div className="flex items-center justify-center sm:justify-start">
              <Plus className="mr-1 sm:mr-2" size={14} /> <span className="hidden sm:inline">Guardar</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

const styles = `
  .no-spinners::-webkit-inner-spin-button,
  .no-spinners::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .no-spinners {
    -moz-appearance: textfield;
  }
`;

const NoSpinnersStyle = () => <style>{styles}</style>;

const EditarObligacionWithNoSpinners: React.FC<EditarObligacionProps> = (props) => (
  <>
    <NoSpinnersStyle />
    <EditarObligacion {...props} />
  </>
);

export default EditarObligacionWithNoSpinners;
