import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initMonitoring } from '@/lib/monitoring';
import App from './App.tsx';
import './index.css';

// Initialize error monitoring
initMonitoring();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
