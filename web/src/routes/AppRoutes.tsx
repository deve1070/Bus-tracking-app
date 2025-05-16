import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/dashboard/Dashboard';
import StationManagement from '../pages/stations/StationManagement';
import BusManagement from '../pages/buses/BusManagement';
import UserManagement from '../pages/users/UserManagement';
import RealTimeMonitoring from '../pages/monitoring/RealTimeMonitoring';
import MessagingNotifications from '../pages/notifications/MessagingNotifications';
import FeedbackManagement from '../pages/feedback/FeedbackManagement';
import Analytics from '../pages/analytics/Analytics';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
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
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
};

export default AppRoutes;