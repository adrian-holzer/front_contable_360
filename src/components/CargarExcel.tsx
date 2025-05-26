import React, { useState } from 'react';
import axios from 'axios';
import { Upload } from 'lucide-react';
import { API_BASE_URL } from '../config/config'; // Asegúrate de tener esta ruta correcta

interface CargarExcelProps {
  onUploadSuccess?: () => void; // Prop opcional para notificar éxito
  onUploadError?: (error: string) => void; // Prop opcional para notificar error
}

const CargarExcel: React.FC<CargarExcelProps> = ({ onUploadSuccess, onUploadError }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null); // Nuevo estado para el nombre del archivo

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setFileName(file.name); // Guarda el nombre del archivo
    } else {
      setSelectedFile(null);
      setFileName(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Por favor, selecciona un archivo Excel.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/obligaciones/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploading(false);
      setSelectedFile(null);
      setFileName(null); // Resetea el nombre del archivo después de la carga
      if (onUploadSuccess) {
        onUploadSuccess(); // Llama a la función de éxito si se proporciona
      }
    } catch (error: any) {
      console.error('Error al subir el archivo:', error);
      setUploading(false);
      setUploadError('Error al subir el archivo. Por favor, intenta nuevamente.');
      if (onUploadError && error.response && error.response.data && error.response.data.message) {
        onUploadError(error.response.data.message); // Llama a la función de error con el mensaje del backend si está disponible
      } else if (onUploadError) {
        onUploadError('Error desconocido al subir el archivo.');
      }
    }
  };

  return (
    <div className="flex items-center space-x-4 mb-4">
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        className="hidden"
        id="excel-upload"
      />
      <label htmlFor="excel-upload" className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        <Upload className="inline-block mr-2" size={16} />
        Seleccionar Excel
      </label>
      {fileName && <span className="text-gray-600 text-sm">{fileName}</span>} {/* Muestra el nombre del archivo */}
      <button
        onClick={handleUpload}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        disabled={!selectedFile || uploading}
      >
        {uploading ? 'Subiendo...' : <Upload className="inline-block mr-2" size={16} />}
        {uploading ? '' : 'Cargar Excel'}
      </button>
      {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}
    </div>
  );
};

export default CargarExcel;