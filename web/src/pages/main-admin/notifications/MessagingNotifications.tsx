import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useNotification } from '../../../contexts/NotificationContext';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  status: 'sent' | 'pending' | 'failed';
  recipients: string[];
  createdAt: string;
}

interface NotificationForm {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  notificationType: 'all' | 'drivers' | 'route' | 'station';
  routeId?: string;
  stationId?: string;
  data?: Record<string, string>;
}

const MessagingNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newNotification, setNewNotification] = useState<NotificationForm>({
    title: '',
    message: '',
    type: 'info',
    notificationType: 'all',
  });

  const { addNotification } = useNotification();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
      setError('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch notifications';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let endpoint = '/notifications';
      let payload = { ...newNotification };

      switch (newNotification.notificationType) {
        case 'drivers':
          endpoint = '/notifications/drivers';
          break;
        case 'route':
          if (!newNotification.routeId) {
            throw new Error('Route ID is required for route notifications');
          }
          endpoint = '/notifications/route';
          payload = {
            routeId: newNotification.routeId,
            title: newNotification.title,
            message: newNotification.message,
            type: newNotification.type,
            notificationType: newNotification.notificationType,
            data: {
              type: newNotification.type,
              routeId: newNotification.routeId
            }
          };
          break;
        case 'station':
          if (!newNotification.stationId) {
            throw new Error('Station ID is required for station notifications');
          }
          endpoint = '/notifications/station';
          payload = {
            stationId: newNotification.stationId,
            title: newNotification.title,
            message: newNotification.message,
            type: newNotification.type,
            notificationType: newNotification.notificationType,
            data: {
              type: newNotification.type,
              stationId: newNotification.stationId
            }
          };
          break;
      }

      await api.post(endpoint, payload);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Notification sent successfully',
      });
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        notificationType: 'all',
      });
      fetchNotifications();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to send notification';
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Messaging & Notifications</h1>
      
      {/* Send New Notification Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Send New Notification</h2>
        <form onSubmit={handleSendNotification} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={newNotification.title}
              onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              value={newNotification.message}
              onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              id="type"
              value={newNotification.type}
              onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as any })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div>
            <label htmlFor="notificationType" className="block text-sm font-medium text-gray-700">
              Send To
            </label>
            <select
              id="notificationType"
              value={newNotification.notificationType}
              onChange={(e) => setNewNotification({ ...newNotification, notificationType: e.target.value as any })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
            >
              <option value="all">All Users</option>
              <option value="drivers">All Drivers</option>
              <option value="route">Route Passengers</option>
              <option value="station">Station Passengers</option>
            </select>
          </div>

          {newNotification.notificationType === 'route' && (
            <div>
              <label htmlFor="routeId" className="block text-sm font-medium text-gray-700">
                Route ID
              </label>
              <input
                type="text"
                id="routeId"
                value={newNotification.routeId || ''}
                onChange={(e) => setNewNotification({ ...newNotification, routeId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
                required
              />
            </div>
          )}

          {newNotification.notificationType === 'station' && (
            <div>
              <label htmlFor="stationId" className="block text-sm font-medium text-gray-700">
                Station ID
              </label>
              <input
                type="text"
                id="stationId"
                value={newNotification.stationId || ''}
                onChange={(e) => setNewNotification({ ...newNotification, stationId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Send Notification
          </button>
        </form>
      </div>

      {/* Notification History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Notification History</h2>
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-gray-600">No notifications found.</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg ${
                  notification.type === 'info'
                    ? 'bg-blue-50'
                    : notification.type === 'warning'
                    ? 'bg-yellow-50'
                    : notification.type === 'success'
                    ? 'bg-green-50'
                    : 'bg-red-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Sent to {notification.recipients.length} recipients
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        notification.status === 'sent'
                          ? 'bg-green-100 text-green-800'
                          : notification.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {notification.status}
                    </span>
                    <span className="mt-2 text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingNotifications;