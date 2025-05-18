import React, { useState, useEffect } from 'react';

interface Station {
  id?: number;
  name: string;
  location: string;
  status: 'active' | 'maintenance' | 'closed';
  capacity: number;
  facilities: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface StationFormProps {
  station?: Station;
  onSubmit: (station: Station) => void;
  onCancel: () => void;
}

const StationForm: React.FC<StationFormProps> = ({ station, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Station>({
    name: '',
    location: '',
    status: 'active',
    capacity: 0,
    facilities: [],
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
  });

  useEffect(() => {
    if (station) {
      setFormData(station);
    }
  }, [station]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleFacilityChange = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Station Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2"
          required
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as Station['status'] })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2"
        >
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="col-span-2">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          type="text"
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2"
          required
        />
      </div>

      <div>
        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
          Capacity
        </label>
        <input
          type="number"
          id="capacity"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2"
          required
          min="0"
        />
      </div>

      <div className="col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Facilities
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['Parking', 'Restrooms', 'Waiting Area', 'Ticket Counter', 'WiFi', 'Food Court'].map((facility) => (
            <div key={facility} className="flex items-center">
              <input
                type="checkbox"
                id={facility}
                checked={formData.facilities.includes(facility)}
                onChange={() => handleFacilityChange(facility)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={facility} className="ml-2 block text-sm text-gray-700">
                {facility}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
          Latitude
        </label>
        <input
          type="number"
          id="latitude"
          value={formData.coordinates.latitude}
          onChange={(e) => setFormData({
            ...formData,
            coordinates: { ...formData.coordinates, latitude: parseFloat(e.target.value) }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2"
          required
          step="any"
        />
      </div>

      <div>
        <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
          Longitude
        </label>
        <input
          type="number"
          id="longitude"
          value={formData.coordinates.longitude}
          onChange={(e) => setFormData({
            ...formData,
            coordinates: { ...formData.coordinates, longitude: parseFloat(e.target.value) }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2"
          required
          step="any"
        />
      </div>

      <div className="col-span-3 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {station ? 'Update Station' : 'Add Station'}
        </button>
      </div>
    </form>
  );
};

export default StationForm; 