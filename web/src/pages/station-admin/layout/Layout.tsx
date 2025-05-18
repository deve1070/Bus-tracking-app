import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Bus,
  Users2,
  Bell,
  Settings,
} from 'lucide-react';
import StationAdminLayout from '../../../components/layout/StationAdminLayout';

const navigation = [
  { name: 'Dashboard', href: '/station-admin', icon: LayoutDashboard },
  { name: 'Station Buses', href: '/station-admin/buses', icon: Bus },
  { name: 'Passengers', href: '/station-admin/passengers', icon: Users2 },
  { name: 'Notifications', href: '/station-admin/notifications', icon: Bell },
  { name: 'Settings', href: '/station-admin/settings', icon: Settings },
];

const StationAdminLayoutWrapper: React.FC = () => {
  return (
    <StationAdminLayout navigation={navigation}>
      <Outlet />
    </StationAdminLayout>
  );
};

export default StationAdminLayoutWrapper; 