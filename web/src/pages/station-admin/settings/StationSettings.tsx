import React from 'react';
import { User, Bell, Shield, Clock } from 'lucide-react';

const StationSettings: React.FC = () => {
  const settingsSections = [
    {
      id: 1,
      title: 'Profile Settings',
      icon: User,
      description: 'Update your station profile and contact information'
    },
    {
      id: 2,
      title: 'Notification Preferences',
      icon: Bell,
      description: 'Configure how you receive notifications'
    },
    {
      id: 3,
      title: 'Security Settings',
      icon: Shield,
      description: 'Manage security and access controls'
    },
    {
      id: 4,
      title: 'Operating Hours',
      icon: Clock,
      description: 'Set station operating hours and schedules'
    }
  ];

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <div className="mt-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {settingsSections.map((section) => (
                <li key={section.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <section.icon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-indigo-600">{section.title}</div>
                          <div className="text-sm text-gray-500">{section.description}</div>
                        </div>
                      </div>
                      <div>
                        <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                          Configure
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

export default StationSettings; 