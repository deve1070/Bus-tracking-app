import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainAdminDashboard from './dashboard/Dashboard';
import BusManagement from './buses/BusManagement';
import UserManagement from './users/UserManagement';
import StationManagement from './stations/StationManagement';
import Analytics from './analytics/Analytics';
import MessagingNotifications from './notifications/MessagingNotifications';

const MainAdmin: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainAdminDashboard />} />
      <Route path="/buses" element={<BusManagement />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/stations" element={<StationManagement />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/notifications" element={<MessagingNotifications />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default MainAdmin; 