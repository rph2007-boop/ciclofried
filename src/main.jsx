import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/index.css';
import '@/lib/i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <AuthProvider>
      <App />
    </AuthProvider>
  </>
);