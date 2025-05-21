import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { NotificationProvider } from './components/NotificationContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   
      <App />

  </StrictMode>
);
