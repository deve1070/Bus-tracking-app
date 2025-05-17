import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Bus,
  Users,
  Bell,
  Settings,
  Map,
  BarChart,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Buses', href: '/admin/buses', icon: Bus },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Stations', href: '/admin/stations', icon: Map },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const MainAdminLayout: React.FC = () => {
  return (
    <AdminLayout title="Admin Dashboard" navigation={navigation}>
      <Outlet />
    </AdminLayout>
  );
};

export default MainAdminLayout; 