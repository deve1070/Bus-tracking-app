import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Bus, MapPin, Users, Map } from 'lucide-react';

const MobileNavigation = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Stations', path: '/stations', icon: <MapPin size={20} /> },
    { name: 'Buses', path: '/buses', icon: <Bus size={20} /> },
    { name: 'Users', path: '/users', icon: <Users size={20} /> },
    { name: 'Monitoring', path: '/monitoring', icon: <Map size={20} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-20">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center p-2 rounded-md ${
                isActive
                  ? 'text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
            end={item.path === '/'}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;