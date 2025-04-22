import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Operativo from '../components/Operativo';
import Configuraciones from '../components/Configuraciones';
import ListaObligaciones from '../components/ListaObligaciones';
import NuevaObligacionPage from '../components/NuevaObligacionPage';

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/operativo" element={<Operativo />} />
            <Route path="/configuraciones" element={<Configuraciones />} />
            <Route path="/obligaciones" element={<ListaObligaciones />} />
            <Route path="/nueva-obligacion" element={<NuevaObligacionPage />} />
            <Route path="/" element={<Operativo />} /> {/* Ruta por defecto */}
            {/* Otras rutas de tu aplicación */}
        </Routes>
    );
};