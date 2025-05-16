import React from 'react';

const MessagingNotifications = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Messaging & Notifications</h1>
      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Notification Center</h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              No new notifications at this time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingNotifications;