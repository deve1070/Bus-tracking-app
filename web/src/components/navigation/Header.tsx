import React from 'react';
import { Menu, Bell, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type HeaderProps = {
  onMenuClick: () => void;
};

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left section with menu button (mobile) and search */}
        <div className="flex items-center">
          <button 
            className="md:hidden mr-4 text-gray-500 hover:text-gray-700"
            onClick={onMenuClick}
          >
            <Menu size={24} />
          </button>
          
          <div className="relative hidden sm:block w-64">
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Right section with notifications and profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button className="p-1 rounded-full hover:bg-gray-100">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>
          </div>
          
          {/* User profile */}
          {user && (
            <div className="flex items-center cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold mr-2">
                {user.name.charAt(0)}
              </div>
              <span className="font-medium text-sm hidden md:inline-block">{user.name}</span>
              <ChevronDown size={16} className="ml-1 text-gray-500 hidden md:block" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;