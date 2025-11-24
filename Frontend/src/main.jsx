import React from 'react';
import ReactDOM from 'react-dom/client';
import App from "./App.jsx";
import '@/index.css';
import { initializeDemoData } from '@/utils/demoData';
import { v4 as uuidv4 } from 'uuid';

// Initialize demo data on app start
initializeDemoData();

// Initialize universities list if not present
if (!localStorage.getItem('quickmeal_universities')) {
  const initialUniversities = [
    { id: uuidv4(), name: 'University of Colombo' },
    { id: uuidv4(), name: 'University of Peradeniya' },
    { id: uuidv4(), name: 'University of Moratuwa' },
    { id: uuidv4(), name: 'University of Sri Jayewardenepura' },
  ];
  localStorage.setItem('quickmeal_universities', JSON.stringify(initialUniversities));
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);