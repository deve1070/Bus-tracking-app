import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationContainer from './components/notifications/NotificationContainer';
import AppRoutes from './routes/AppRoutes';
import './index.css';
import StationBusManagement from './pages/station-admin/buses/StationBusManagement';
import UpdateBusForm from './pages/station-admin/buses/UpdateBusForm';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <NotificationContainer />
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;