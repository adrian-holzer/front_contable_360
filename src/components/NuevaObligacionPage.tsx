import React from 'react';
import NuevaObligacion from '../components/NuevaObligacion'; // Ajusta la ruta si es necesario
import { useNavigate } from 'react-router-dom'; // Necesitas react-router-dom instalado

const NuevaObligacionPage: React.FC = () => {
  const navigate = useNavigate();

  const handleObligacionCreated = () => {
    navigate('/obligaciones'); // Redirige a la página del listado
    alert('Nueva obligación creada exitosamente.'); // O usa un sistema de notificación mejor
  };

  const handleCreationError = (error: string) => {
    alert(`Error al crear la obligación: ${error}`); // O usa un sistema de notificación mejor
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Crear Nueva Obligación</h1>
      <NuevaObligacion onObligacionCreated={handleObligacionCreated} onCreationError={handleCreationError} />
      <button
        onClick={() => navigate('/obligaciones')}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mt-4 focus:outline-none focus:shadow-outline"
      >
        Volver al Listado
      </button>
    </div>
  );
};

export default NuevaObligacionPage;