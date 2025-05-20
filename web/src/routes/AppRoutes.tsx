import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import Settings from '../pages/main-admin/settings/Settings';

// Station Admin Pages
import StationDashboard from '../pages/station-admin/dashboard/Dashboard';
import StationBuses from '../pages/station-admin/buses/BusManagement';
import PassengerManagement from '../pages/station-admin/passengers/PassengerManagement';
import StationNotifications from '../pages/station-admin/notifications/StationNotifications';
import StationSettings from '../pages/station-admin/settings/StationSettings';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Station Admin Routes - Now First */}
      <Route path="/station-admin" element={<StationAdminLayout />}>
        <Route index element={<StationDashboard />} />
        <Route path="buses" element={<StationBuses />} />
        <Route path="passengers" element={<PassengerManagement />} />
        <Route path="notifications" element={<StationNotifications />} />
        <Route path="settings" element={<StationSettings />} />
      </Route>

      {/* Main Admin Routes */}
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
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Redirect all unmatched routes to station admin */}
      <Route path="*" element={<Navigate to="/station-admin" replace />} />
    </Routes>
  );
};

export default AppRoutes;