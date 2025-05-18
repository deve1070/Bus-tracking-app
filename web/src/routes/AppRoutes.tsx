import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import PasswordReset from '../pages/main-admin/auth/PasswordReset';
import MainAdminLayout from '../pages/main-admin/layout/Layout';
import StationAdminLayout from '../pages/station-admin/layout/Layout';

// Main Admin Pages
import Dashboard from '../pages/main-admin/dashboard/Dashboard';
import StationManagement from '../pages/main-admin/stations/StationManagement';
import BusManagement from '../pages/main-admin/buses/BusManagement';
import UserManagement from '../pages/main-admin/users/UserManagement';
import RealTimeMonitoring from '../pages/main-admin/monitoring/RealTimeMonitoring';
import MessagingNotifications from '../pages/main-admin/notifications/MessagingNotifications';
import FeedbackManagement from '../pages/main-admin/feedback/FeedbackManagement';
import Analytics from '../pages/main-admin/analytics/Analytics';
import PaymentManagement from '../pages/main-admin/payments/PaymentManagement';

// Station Admin Pages
import StationDashboard from '../pages/station-admin/dashboard/Dashboard';
import StationBuses from '../pages/station-admin/buses/BusManagement';
import PassengerManagement from '../pages/station-admin/passengers/PassengerManagement';
import StationNotifications from '../pages/station-admin/notifications/StationNotifications';
import StationSettings from '../pages/station-admin/settings/StationSettings';

import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  const { isAuthenticated, userRole } = useAuth();

  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    return userRole === 'station_admin' ? '/station-admin' : '/admin';
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      
      {/* Main Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<MainAdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="stations" element={<StationManagement />} />
          <Route path="buses" element={<BusManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="monitoring" element={<RealTimeMonitoring />} />
          <Route path="notifications" element={<MessagingNotifications />} />
          <Route path="feedback" element={<FeedbackManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="payments" element={<PaymentManagement />} />
        </Route>
      </Route>

      {/* Station Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['station_admin']} />}>
        <Route path="/station-admin" element={<StationAdminLayout />}>
          <Route index element={<StationDashboard />} />
          <Route path="buses" element={<StationBuses />} />
          <Route path="passengers" element={<PassengerManagement />} />
          <Route path="notifications" element={<StationNotifications />} />
          <Route path="settings" element={<StationSettings />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
};

export default AppRoutes;