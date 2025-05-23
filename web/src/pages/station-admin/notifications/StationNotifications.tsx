import React from 'react';
import { Bell } from 'lucide-react';

const StationNotifications: React.FC = () => {
  const notifications = [
    {
      id: 1,
      title: 'Bus Arrival Update',
      message: 'Bus #123 has arrived at platform 2',
      time: '2 minutes ago',
      type: 'info'
    },
    {
      id: 2,
      title: 'Schedule Change',
      message: 'Route #45 schedule has been updated',
      time: '1 hour ago',
      type: 'warning'
    },
    {
      id: 3,
      title: 'Maintenance Alert',
      message: 'Platform 1 maintenance scheduled for tomorrow',
      time: '3 hours ago',
      type: 'alert'
    }
  ];

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        <div className="mt-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Bell className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-indigo-600">{notification.title}</div>
                          <div className="text-sm text-gray-500">{notification.message}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">{notification.time}</span>
                        <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                          Mark as Read
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationNotifications; 