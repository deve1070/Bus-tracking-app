import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Bus,
  Users,
  Bell,
  Settings,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';

const navigation = [
  { name: 'Dashboard', href: '/station-admin', icon: LayoutDashboard },
  { name: 'Buses', href: '/station-admin/buses', icon: Bus },
  { name: 'Passengers', href: '/station-admin/passengers', icon: Users },
  { name: 'Notifications', href: '/station-admin/notifications', icon: Bell },
  { name: 'Settings', href: '/station-admin/settings', icon: Settings },
];

const StationAdminLayout: React.FC = () => {
  return (
    <AdminLayout title="Station Admin" navigation={navigation}>
      <Outlet />
    </AdminLayout>
  );
};

export default StationAdminLayout; 