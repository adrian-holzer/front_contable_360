import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const goToSecondPage = () => {
    navigate('/second');
  };

  return (
    <div>
      <h1>Página de Inicio Simple</h1>
      <button onClick={goToSecondPage}>Ir a la Segunda Página</button>
    </div>
  );
};

const SecondPage = () => {
  const navigate = useNavigate();

  const goToHomePage = () => {
    navigate('/');
  };

  return (
    <div>
      <h1>Segunda Página Simple</h1>
      <button onClick={goToHomePage}>Volver a la Página de Inicio</button>
    </div>
  );
};

const SimpleNavigation = () => {
  return (
   <div></div>
  );
};

export default SimpleNavigation;