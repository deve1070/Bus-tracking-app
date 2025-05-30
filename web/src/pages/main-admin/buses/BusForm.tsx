import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Bus {
  _id?: string;
  busNumber: string;
  routeNumber: string;
  capacity: number;
  deviceId: string;
  currentLocation: {
    type: string;
    coordinates: [number, number];
  };
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  driverId?: string;
  currentStationId?: string;
  route: {
    stations: string[];
    estimatedTime: number;
  };
  schedule: {
    departureTime: string;
    arrivalTime: string;
  };
  isOnRoute: boolean;
  currentPassengerCount: number;
  lastUpdateTime: Date;
}

interface BusFormProps {
  bus?: Bus;
  onSubmit: (busData: Omit<Bus, '_id'>) => void;
  onCancel: () => void;
}

const BusForm: React.FC<BusFormProps> = ({ bus, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Bus, '_id'>>({
    busNumber: '',
    routeNumber: '',
    capacity: 0,
    deviceId: '',
    currentLocation: {
      type: 'Point',
      coordinates: [0, 0]
    },
    status: 'INACTIVE',
    route: {
      stations: [],
      estimatedTime: 0
    },
    schedule: {
      departureTime: new Date().toISOString(),
      arrivalTime: new Date().toISOString()
    },
    isOnRoute: false,
    currentPassengerCount: 0,
    lastUpdateTime: new Date()
  });

  useEffect(() => {
    if (bus) {
      setFormData({
        busNumber: bus.busNumber,
        routeNumber: bus.routeNumber,
        capacity: bus.capacity,
        deviceId: bus.deviceId,
        currentLocation: bus.currentLocation,
        status: bus.status,
        driverId: bus.driverId,
        currentStationId: bus.currentStationId,
        route: bus.route,
        schedule: bus.schedule,
        isOnRoute: bus.isOnRoute,
        currentPassengerCount: bus.currentPassengerCount,
        lastUpdateTime: bus.lastUpdateTime
      });
    } else {
      // Reset form when adding new bus
      setFormData({
        busNumber: '',
        routeNumber: '',
        capacity: 0,
        deviceId: '',
        currentLocation: {
          type: 'Point',
          coordinates: [0, 0]
        },
        status: 'INACTIVE',
        route: {
          stations: [],
          estimatedTime: 0
        },
        schedule: {
          departureTime: new Date().toISOString(),
          arrivalTime: new Date().toISOString()
        },
        isOnRoute: false,
        currentPassengerCount: 0,
        lastUpdateTime: new Date()
      });
    }
  }, [bus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure all required fields are present and properly formatted
    const submitData = {
      ...formData,
      busNumber: formData.busNumber.trim(),
      routeNumber: formData.routeNumber.trim(),
      deviceId: formData.deviceId.trim(),
      capacity: parseInt(formData.capacity.toString()) || 0,
      currentLocation: {
        type: 'Point',
        coordinates: [0, 0] as [number, number]
      },
      route: {
        stations: [],
        estimatedTime: parseInt(formData.route.estimatedTime.toString()) || 0
      },
      schedule: {
        departureTime: formData.schedule.departureTime,
        arrivalTime: formData.schedule.arrivalTime
      },
      status: formData.status || 'INACTIVE',
      isOnRoute: false,
      currentPassengerCount: 0,
      lastUpdateTime: new Date()
    };

    onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'estimatedTime' || name === 'currentPassengerCount' 
        ? parseInt(value) || 0 
        : value,
    }));
  };

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [name]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">
          {bus ? 'Edit Bus' : 'Add New Bus'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="busNumber" className="block text-sm font-medium text-gray-700">
            Bus Number
          </label>
          <input
            type="text"
            name="busNumber"
            id="busNumber"
            value={formData.busNumber}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="routeNumber" className="block text-sm font-medium text-gray-700">
            Route Number
          </label>
          <input
            type="text"
            name="routeNumber"
            id="routeNumber"
            value={formData.routeNumber}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
            Capacity
          </label>
          <input
            type="number"
            name="capacity"
            id="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700">
            Device ID
          </label>
          <input
            type="text"
            name="deviceId"
            id="deviceId"
            value={formData.deviceId}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="ACTIVE">Active</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div>
          <label htmlFor="departureTime" className="block text-sm font-medium text-gray-700">
            Departure Time
          </label>
          <input
            type="datetime-local"
            name="departureTime"
            id="departureTime"
            value={formData.schedule.departureTime.slice(0, 16)}
            onChange={handleScheduleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="arrivalTime" className="block text-sm font-medium text-gray-700">
            Arrival Time
          </label>
          <input
            type="datetime-local"
            name="arrivalTime"
            id="arrivalTime"
            value={formData.schedule.arrivalTime.slice(0, 16)}
            onChange={handleScheduleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700">
            Estimated Time (minutes)
          </label>
          <input
            type="number"
            name="estimatedTime"
            id="estimatedTime"
            value={formData.route.estimatedTime}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              setFormData(prev => ({
                ...prev,
                route: {
                  ...prev.route,
                  estimatedTime: value
                }
              }));
            }}
            required
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {bus ? 'Update' : 'Add'} Bus
        </button>
      </div>
    </form>
  );
};

export default BusForm; 