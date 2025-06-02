import React, { useEffect, useState } from 'react';
import NotificationForm from '../../../../../client/src/components/station-admin/NotificationForm';
import axios from 'axios';
import { Bell } from 'lucide-react';

const StationNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('http://localhost:3000/api/notifications', config);
      setNotifications(response.data);
    } catch (error) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Notifications</h1>
        <NotificationForm onNotificationSent={fetchNotifications} />
        <div className="mt-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {loading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications found.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li key={notification._id}>
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
                          <span className="text-sm text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationNotifications; 