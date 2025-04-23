import React, { useState } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { API_BASE_URL } from '../config/config';

interface NuevaObligacionProps {
  onObligacionCreated?: () => void;
  onCreationError?: (error: string) => void;
}

interface VencimientoForm {
  mes: number;
  terminacionCuit: number;
  dia: number | null;
}

const meses = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

const terminacionesCuit = Array.from({ length: 10 }, (_, i) => i);

const NuevaObligacion: React.FC<NuevaObligacionProps> = ({ onObligacionCreated, onCreationError }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [vencimientos, setVencimientos] = useState<VencimientoForm[]>(
    meses.flatMap((_, mesIndex) =>
      terminacionesCuit.map(cuit => ({ mes: mesIndex + 1, terminacionCuit: cuit, dia: null }))
    )
  );
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  const handleNombreChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNombre(event.target.value);
  };

  const handleDescripcionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescripcion(event.target.value);
  };

  const handleObservacionesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservaciones(event.target.value);
  };

  const handleVencimientoDiaChange = (mes: number, terminacionCuit: number, value: string) => {
    const newVencimientos = vencimientos.map(v =>
      v.mes === mes && v.terminacionCuit === terminacionCuit ? { ...v, dia: parseInt(value) || null } : v
    );
    setVencimientos(newVencimientos);
  };

  const handleCrearObligacion = async () => {
    setIsCreating(true);
    setCreationError(null);

    const vencimientosParaBackend = vencimientos
      .filter(v => v.dia !== null)
      .map(v => ({ mes: v.mes, terminacionCuit: v.terminacionCuit, dia: v.dia }));

    const nuevaObligacionData = {
      nombre,
      descripcion,
      observaciones,
      vencimientos: vencimientosParaBackend,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/obligaciones`, nuevaObligacionData);
      console.log('Obligación creada exitosamente:', response.data);
      setIsCreating(false);
      setNombre('');
      setDescripcion('');
      setObservaciones('');
      setVencimientos(
        meses.flatMap((_, mesIndex) =>
          terminacionesCuit.map(cuit => ({ mes: mesIndex + 1, terminacionCuit: cuit, dia: null }))
        )
      );
      if (onObligacionCreated) {
        onObligacionCreated();
      }
    } catch (error: any) {
      console.error('Error al crear la obligación:', error);
      setIsCreating(false);
      setCreationError('Error al crear la obligación. Por favor, intenta nuevamente.');
      if (onCreationError && error.response && error.response.data && error.response.data.message) {
        onCreationError(error.response.data.message);
      } else if (onCreationError) {
        onCreationError('Error desconocido al crear la obligación.');
      }
    }
  };

  return (
    <div className=" bg-white shadow-md rounded-md p-4 md:p-6">

      <div className="mb-4">
        <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">
          Nombre:
        </label>
        <input
          type="text"
          id="nombre"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
          value={nombre}
          onChange={handleNombreChange}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="descripcion" className="block text-gray-700 text-sm font-bold mb-2">
          Descripción:
        </label>
        <textarea
          id="descripcion"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
          value={descripcion}
          onChange={handleDescripcionChange}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="observaciones" className="block text-gray-700 text-sm font-bold mb-2">
          Observaciones:
        </label>
        <textarea
          id="observaciones"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
          value={observaciones}
          onChange={handleObservacionesChange}
        />
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-left">Vencimientos por CUIT</h3>
        <div className="overflow-x-auto w-full">
          <table className="border border-gray-200 text-sm table-auto mx-0" style={{ minWidth: '800px' }}> {/* Ancho mínimo aún mayor */}
            <thead>
              <tr>
                <th className="py-2 px-3 border-b text-left w-[90px]">Mes/CUIT</th> {/* Ancho fijo para Mes */}
                {terminacionesCuit.map(cuit => (
                  <th key={cuit} className="py-2 px-3 border-b text-center w-[70px]"> {/* Ancho fijo para CUIT */}
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
                      <div className="mx-auto w-full" style={{ maxWidth: '60px' }}> {/* Contenedor más ancho */}
                        <input
                          type="number"
                          min="1"
                          max="31"
                          className="shadow appearance-none border rounded w-full py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center text-sm" 
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

      {creationError && <p className="text-red-500 text-sm mb-2 text-left">{creationError}</p>}

      <div className="flex justify-end w-full mt-4">
        <button
          onClick={handleCrearObligacion}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm w-full sm:w-auto max-w-[120px]"
          disabled={isCreating}
        >
          {isCreating ? 'Creando' : (
            <div className="flex items-center justify-center sm:justify-start">
              <Plus className="mr-1 sm:mr-2" size={14} /> <span className="hidden sm:inline">Crear</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default NuevaObligacion;