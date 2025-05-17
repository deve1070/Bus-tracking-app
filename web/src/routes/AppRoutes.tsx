import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import PasswordReset from '../pages/main-admin/auth/PasswordReset';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/main-admin/dashboard/Dashboard';
import StationManagement from '../pages/main-admin/stations/StationManagement';
import BusManagement from '../pages/main-admin/buses/BusManagement';
import UserManagement from '../pages/main-admin/users/UserManagement';
import RealTimeMonitoring from '../pages/main-admin/monitoring/RealTimeMonitoring';
import MessagingNotifications from '../pages/main-admin/notifications/MessagingNotifications';
import FeedbackManagement from '../pages/main-admin/feedback/FeedbackManagement';
import Analytics from '../pages/main-admin/analytics/Analytics';
import PaymentManagement from '../pages/main-admin/payments/PaymentManagement';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardLayout />}>
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
      
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
};

export default AppRoutes;