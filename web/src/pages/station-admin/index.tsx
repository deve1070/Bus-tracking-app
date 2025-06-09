import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StationAdminDashboard from './dashboard/Dashboard';
import StationBusManagement from './buses/StationBusManagement';
import BusDetails from './buses/BusDetails';
import PassengerManagement from './passengers/PassengerManagement';
import StationNotifications from './notifications/StationNotifications';
import StationSettings from './settings/StationSettings';

const StationAdmin: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<StationAdminDashboard />} />
      <Route path="/buses" element={<StationBusManagement />} />
      <Route path="/buses/:id" element={<BusDetails />} />
      <Route path="/passengers" element={<PassengerManagement />} />
      <Route path="/notifications" element={<StationNotifications />} />
      <Route path="/settings" element={<StationSettings />} />
      <Route path="*" element={<Navigate to="/station-admin" replace />} />
    </Routes>
  );
};

export default StationAdmin; 