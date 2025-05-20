import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  MapPin, 
  Bus, 
  Users, 
  Map, 
  Bell, 
  MessageSquare, 
  BarChart2, 
  LogOut, 
  X
} from 'lucide-react';

type SidebarProps = {
  mobile?: boolean;
  onClose?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ mobile, onClose }) => {
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Stations', path: '/stations', icon: <MapPin size={20} /> },
    { name: 'Buses', path: '/buses', icon: <Bus size={20} /> },
    { name: 'Users & Drivers', path: '/users', icon: <Users size={20} /> },
    { name: 'Real-Time Monitoring', path: '/monitoring', icon: <Map size={20} /> },
    { name: 'Notifications', path: '/notifications', icon: <Bell size={20} /> },
    { name: 'Feedback', path: '/feedback', icon: <MessageSquare size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={20} /> },
  ];

  const activeClass = "bg-blue-100 text-blue-700";
  const inactiveClass = "text-gray-700 hover:bg-gray-100";

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-gray-200">
      {mobile && (
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-xl text-blue-700">TransitAdmin</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
      )}
      
      {!mobile && (
        <div className="p-6 border-b">
          <h2 className="font-bold text-xl text-blue-700">Main Admin</h2>
        </div>
      )}

      {user && (
        <div className="px-6 py-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">
                {user.role === 'main_admin' ? 'Main Admin' : 'Station Admin'}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto pt-4 pb-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive ? activeClass : inactiveClass
                  }`
                }
                end={item.path === '/'}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t p-4">
        <button
          onClick={logout}
          className="flex items-center justify-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <LogOut size={20} className="mr-2" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;