import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Bus,
  Bell,
  Map,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';

const navigation = [
  { name: 'Dashboard', href: '/station-admin', icon: LayoutDashboard },
  { name: 'Station Buses', href: '/station-admin/buses', icon: Bus },
  { name: 'Monitoring', href: '/station-admin/monitoring', icon: Map },
  { name: 'Notifications', href: '/station-admin/notifications', icon: Bell },
];

const StationAdminLayoutWrapper: React.FC = () => {
  return (
    <AdminLayout navigation={navigation} title="Station Admin">
      <Outlet />
    </AdminLayout>
  );
};

export default StationAdminLayoutWrapper; 