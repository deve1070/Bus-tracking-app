import React, { useState, useEffect } from 'react';
import { Clock, Building, Wifi, Parking, Wheelchair, Coffee } from 'lucide-react';

interface StationProfile {
  name: string;
  location: string;
  contactNumber: string;
  email: string;
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  facilities: {
    wifi: boolean;
    parking: boolean;
    wheelchair: boolean;
    cafe: boolean;
  };
}

const StationSettings: React.FC = () => {
  const [profile, setProfile] = useState<StationProfile>({
    name: '',
    location: '',
    contactNumber: '',
    email: '',
    operatingHours: {
      monday: { open: '06:00', close: '22:00' },
      tuesday: { open: '06:00', close: '22:00' },
      wednesday: { open: '06:00', close: '22:00' },
      thursday: { open: '06:00', close: '22:00' },
      friday: { open: '06:00', close: '22:00' },
      saturday: { open: '06:00', close: '22:00' },
      sunday: { open: '06:00', close: '22:00' },
    },
    facilities: {
      wifi: true,
      parking: true,
      wheelchair: true,
      cafe: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStationProfile();
  }, []);

  const fetchStationProfile = async () => {
    try {
      const response = await fetch('/api/station/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        setError('Failed to fetch station profile');
      }
    } catch (error) {
      setError('An error occurred while fetching station profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/station/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setSuccess('Station profile updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update station profile');
      }
    } catch (error) {
      setError('An error occurred while updating station profile');
    }
  };

  const handleOperatingHoursChange = (day: string, field: 'open' | 'close', value: string) => {
    setProfile(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleFacilityChange = (facility: keyof StationProfile['facilities']) => {
    setProfile(prev => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [facility]: !prev.facilities[facility],
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Station Settings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your station profile, operating hours, and facilities
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-md bg-green-50 p-4">
          <div className="text-sm text-green-700">{success}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Station Profile */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Station Profile</h3>
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Station Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
                  required
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
                  required
                />
              </div>

              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  value={profile.contactNumber}
                  onChange={(e) => setProfile({ ...profile, contactNumber: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Operating Hours</h3>
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(profile.operatingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </label>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
                      />
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Facilities</h3>
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="wifi"
                  checked={profile.facilities.wifi}
                  onChange={() => handleFacilityChange('wifi')}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="wifi" className="ml-3 flex items-center">
                  <Wifi className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-700">WiFi</span>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="parking"
                  checked={profile.facilities.parking}
                  onChange={() => handleFacilityChange('parking')}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="parking" className="ml-3 flex items-center">
                  <Parking className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-700">Parking</span>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="wheelchair"
                  checked={profile.facilities.wheelchair}
                  onChange={() => handleFacilityChange('wheelchair')}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="wheelchair" className="ml-3 flex items-center">
                  <Wheelchair className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-700">Wheelchair Access</span>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="cafe"
                  checked={profile.facilities.cafe}
                  onChange={() => handleFacilityChange('cafe')}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="cafe" className="ml-3 flex items-center">
                  <Coffee className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-700">Cafe</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default StationSettings; 