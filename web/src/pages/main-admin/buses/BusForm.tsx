import React, { useState, useEffect } from 'react';

interface Bus {
  id?: number;
  plateNumber: string;
  model: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'out_of_service';
  lastMaintenance: string;
  currentRoute?: string;
  driver?: string;
}

interface BusFormProps {
  bus?: Bus;
  onSubmit: (bus: Bus) => void;
  onCancel: () => void;
}

const BusForm: React.FC<BusFormProps> = ({ bus, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Bus>({
    plateNumber: '',
    model: '',
    capacity: 0,
    status: 'active',
    lastMaintenance: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (bus) {
      setFormData(bus);
    }
  }, [bus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
      <div>
        <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700">
          Plate Number
        </label>
        <input
          type="text"
          id="plateNumber"
          value={formData.plateNumber}
          onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2"
          required
        />
      </div>

      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-700">
          Bus Model
        </label>
        <input
          type="text"
          id="model"
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
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
          min="1"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as Bus['status'] })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2"
        >
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="out_of_service">Out of Service</option>
        </select>
      </div>

      <div>
        <label htmlFor="lastMaintenance" className="block text-sm font-medium text-gray-700">
          Last Maintenance Date
        </label>
        <input
          type="date"
          id="lastMaintenance"
          value={formData.lastMaintenance}
          onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2"
          required
        />
      </div>

      <div>
        <label htmlFor="driver" className="block text-sm font-medium text-gray-700">
          Driver (Optional)
        </label>
        <input
          type="text"
          id="driver"
          value={formData.driver || ''}
          onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2"
        />
      </div>

      <div className="col-span-2 flex justify-end space-x-3">
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
          {bus ? 'Update Bus' : 'Add Bus'}
        </button>
      </div>
    </form>
  );
};

export default BusForm; 