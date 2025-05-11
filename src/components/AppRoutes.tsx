import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Operativo from '../components/Operativo';
import Configuraciones from '../components/Configuraciones';
import ListaObligaciones from '../components/ListaObligaciones';
import NuevaObligacionPage from '../components/NuevaObligacionPage';
import AsignarCliente from './AsignarCliente';
import EditarObligacionWithNoSpinners from './EditarObligacion';
import AsignarObligaciones from './AsignarObligaciones';
import AsignarResponsable from './AsignarResponsable';
import ListadoAsignacionesVencimiento from './ListadoAsignacionesVencimiento';

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

            <Route path="/" element={<Operativo />} /> {/* Ruta por defecto */}
            {/* Otras rutas de tu aplicación */}
        </Routes>
    );
};