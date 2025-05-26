// src/AppRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Operativo from '../components/Operativo';
import Configuraciones from '../components/Configuraciones';
import ListaObligaciones from '../components/ListaObligaciones';
import NuevaObligacionPage from '../components/NuevaObligacionPage';
import AsignarCliente from './AsignarCliente'; // Revisa esta ruta si no es correcta
import EditarObligacionWithNoSpinners from './EditarObligacion'; // Revisa esta ruta
import AsignarObligaciones from './AsignarObligaciones'; // Revisa esta ruta
import AsignarResponsable from './AsignarResponsable'; // Revisa esta ruta
import ListadoAsignacionesVencimiento from './ListadoAsignacionesVencimiento'; // Revisa esta ruta
import ProximasAVencerPage from './ProximasAVencerPage'; // Revisa esta ruta

// Aquí también puedes quitar React.FC si te da error
export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/operativo" element={<Operativo />} />
            <Route path="/configuraciones" element={<Configuraciones />} />
            <Route path="/obligaciones" element={<ListaObligaciones />} />
            <Route path="/nueva-obligacion" element={<NuevaObligacionPage />} />
            <Route path="/obligaciones/:id" element={<EditarObligacionWithNoSpinners />} />
            <Route path="/cliente/asignar-obligaciones" element={<AsignarObligaciones />} />
            <Route path="/cliente/asignar-responsable" element={<AsignarResponsable />} />
            <Route path="/asignaciones/listado" element={<ListadoAsignacionesVencimiento />} />

            <Route path="/asignar-cliente" element={<AsignarCliente />} />
            <Route path="/proximas-a-vencer" element={<ProximasAVencerPage />} /> 

            <Route path="/" element={<Operativo />} /> {/* Ruta por defecto */}
            {/* Otras rutas de tu aplicación */}
        </Routes>
    );
};