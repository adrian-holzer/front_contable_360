import React, { useState } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { API_BASE_URL } from '../config/config'; // Asegúrate de tener esta ruta correcta

interface NuevaObligacionProps {
  onObligacionCreated?: () => void; // Prop opcional para notificar la creación exitosa
  onCreationError?: (error: string) => void; // Prop opcional para notificar errores
}

interface VencimientoForm {
  mes: number;
  terminacionCuit: number;
  dia: number | null;
}

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
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
    <div className="bg-white shadow-md rounded-md p-4 md:p-6"> {/* Añadido padding responsivo */}
      <h2 className="text-xl font-semibold mb-4">Crear Nueva Obligación</h2>

      <div className="mb-4">
        <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">
          Nombre:
        </label>
        <input
          type="text"
          id="nombre"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={observaciones}
          onChange={handleObservacionesChange}
        />
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Vencimientos por Terminación de CUIT</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm md:text-base"> {/* Ajuste de tamaño de texto */}
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Mes</th>
                {terminacionesCuit.map(cuit => (
                  <th key={cuit} className="py-2 px-2 md:px-4 border-b text-center"> {/* Padding horizontal responsivo */}
                    Term. {cuit}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {meses.map((mes, mesIndex) => (
                <tr key={mesIndex}>
                  <td className="py-2 px-4 border-b">{mes}</td>
                  {terminacionesCuit.map(cuit => (
                    <td key={cuit} className="py-2 px-2 md:px-4 border-b text-center"> {/* Padding horizontal responsivo */}
                      <input
                        type="number"
                        min="1"
                        max="31"
                        className="shadow appearance-none border rounded w-16 md:w-20 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center" 
                        value={vencimientos.find(v => v.mes === mesIndex + 1 && v.terminacionCuit === cuit)?.dia || ''}
                        onChange={(e) => handleVencimientoDiaChange(mesIndex + 1, cuit, e.target.value)}
                        placeholder="Día"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {creationError && <p className="text-red-500 text-sm mb-2">{creationError}</p>}

      <button
        onClick={handleCrearObligacion}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto" 
        disabled={isCreating}
      >
        {isCreating ? 'Creando...' : <Plus className="inline-block mr-2" size={16} />}
        {isCreating ? 'Creando Obligación' : 'Crear Obligación'}
      </button>
    </div>
  );
};

export default NuevaObligacion;