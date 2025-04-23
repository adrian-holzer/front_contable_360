import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

const AsignarCliente = () => {
  const navigate = useNavigate();

  const goToSecondPage = () => {
    navigate('/obligaciones');
  };

  return (
    <div>
      <h1>Página de Asignar Cliente</h1>
      <button onClick={goToSecondPage}>Ir a la Segunda Página</button>
    </div>
  );
};



export default AsignarCliente;