import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainAdminLayout from '../pages/main-admin/layout/Layout';
import StationAdminLayout from '../pages/station-admin/layout/Layout';
import LoginPage from '../pages/auth/LoginPage';
import PasswordReset from '../pages/auth/PasswordReset';

// Main Admin Pages
import Dashboard from '../pages/main-admin/dashboard/Dashboard';
import StationManagement from '../pages/main-admin/stations/StationManagement';
import BusManagement from '../pages/main-admin/buses/BusManagement';
import UserManagement from '../pages/main-admin/users/UserManagement';
import RealTimeMonitoring from '../pages/main-admin/monitoring/RealTimeMonitoring';
import FeedbackManagement from '../pages/main-admin/feedback/FeedbackManagement';
import Analytics from '../pages/main-admin/analytics/Analytics';
import PaymentManagement from '../pages/main-admin/payments/PaymentManagement';

// Station Admin Pages
import StationDashboard from '../pages/station-admin/dashboard/Dashboard';
import StationBusManagement from '../pages/station-admin/buses/StationBusManagement';
import UpdateBus from '../pages/station-admin/buses/UpdateBus';
import StationNotifications from '../pages/station-admin/notifications/StationNotifications';
import StationMonitoring from '../pages/station-admin/monitoring/RealTimeMonitoring';

const AppRoutes = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {user?.role === 'MainAdmin' ? (
        <Route path="/admin" element={<MainAdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="stations" element={<StationManagement />} />
          <Route path="buses" element={<BusManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="monitoring" element={<RealTimeMonitoring />} />
          <Route path="feedback" element={<FeedbackManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="payments" element={<PaymentManagement />} />
        </Route>
      ) : (
        <Route path="/station-admin" element={<StationAdminLayout />}>
          <Route index element={<StationDashboard />} />
          <Route path="buses" element={<StationBusManagement />} />
          <Route path="buses/update/:id" element={<UpdateBus />} />
          <Route path="monitoring" element={<StationMonitoring />} />
          <Route path="notifications" element={<StationNotifications />} />
        </Route>
      )}
      
      {/* Redirect to appropriate dashboard based on role */}
      <Route path="/" element={
        <Navigate to={user?.role === 'MainAdmin' ? '/admin' : '/station-admin'} replace />
      } />
      
      {/* Catch all route */}
      <Route path="*" element={
        <Navigate to={user?.role === 'MainAdmin' ? '/admin' : '/station-admin'} replace />
      } />
    </Routes>
  );
};

export default AppRoutes;