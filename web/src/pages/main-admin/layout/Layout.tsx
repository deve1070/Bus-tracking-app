import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Bus,
  Users,
  Map,
  BarChart,
  MonitorCheck,
  CreditCard,
  MessageSquare,
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
  { name: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
];

const MainAdminLayout: React.FC = () => {
  return (
    <AdminLayout navigation={navigation} title="Main Admin">
      <Outlet />
    </AdminLayout>
  );
};

export default MainAdminLayout; 