import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#221E28',
              color: '#E8DFEE',
              border: '1px solid #3F3A4A',
              fontSize: '14px',
              fontFamily: '"Poppins", system-ui, sans-serif',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
