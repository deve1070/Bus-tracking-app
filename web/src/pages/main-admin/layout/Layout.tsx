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
  Lock,
  MonitorCheck,
  CreditCard,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Buses', href: '/admin/buses', icon: Bus },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Stations', href: '/admin/stations', icon: Map },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { name: 'Monitoring', href: '/admin/monitoring', icon: MonitorCheck },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Password Reset', href: '/admin/password-reset', icon: Lock },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const MainAdminLayout: React.FC = () => {
  return (
    <AdminLayout navigation={navigation}>
      <Outlet />
    </AdminLayout>
  );
};

export default MainAdminLayout; 