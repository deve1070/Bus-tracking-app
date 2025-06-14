import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../../services/api';

interface Station {
  _id: string;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  address: string;
}

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
  stationId?: string;
  currentStationId?: string;
  route: {
    stations: Array<{
      stationId: string;
      name: string;
      location: {
        type: string;
        coordinates: [number, number];
      };
    }>;
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
  const [stations, setStations] = useState<Station[]>([]);
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
    stationId: '',
    currentStationId: '',
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
    // Fetch stations for assignment
    const fetchStations = async () => {
      try {
        const response = await api.get('/stations');
        setStations(response.data);
      } catch (error) {
        console.error('Error fetching stations:', error);
      }
    };
    fetchStations();
  }, []);

  useEffect(() => {
    if (bus) {
      const formattedBus: Omit<Bus, '_id'> = {
        busNumber: bus.busNumber,
        routeNumber: bus.routeNumber,
        capacity: bus.capacity,
        deviceId: bus.deviceId,
        currentLocation: bus.currentLocation,
        status: bus.status,
        driverId: bus.driverId,
        stationId: bus.stationId,
        currentStationId: typeof bus.currentStationId === 'object' ? (bus.currentStationId as any)._id : bus.currentStationId || '',
        route: bus.route,
        schedule: bus.schedule,
        isOnRoute: bus.isOnRoute,
        currentPassengerCount: bus.currentPassengerCount,
        lastUpdateTime: bus.lastUpdateTime
      };
      setFormData(formattedBus);
    }
  }, [bus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.busNumber || !formData.routeNumber || !formData.capacity || !formData.deviceId || !formData.stationId) {
      alert('Please fill in all required fields');
      return;
    }

    // Format the data before submission
    const formattedData: Omit<Bus, '_id'> = {
      ...formData,
      currentLocation: {
        type: 'Point',
        coordinates: formData.currentLocation.coordinates
      },
      route: {
        stations: formData.route.stations,
        estimatedTime: formData.route.estimatedTime
      },
      schedule: {
        departureTime: formData.schedule.departureTime,
        arrivalTime: formData.schedule.arrivalTime
      }
    };

    onSubmit(formattedData);
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
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="busNumber" className="block text-sm font-medium text-gray-700">
            Bus Number *
          </label>
          <input
            type="text"
            name="busNumber"
            id="busNumber"
            value={formData.busNumber}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="routeNumber" className="block text-sm font-medium text-gray-700">
            Route Number *
          </label>
          <input
            type="text"
            name="routeNumber"
            id="routeNumber"
            value={formData.routeNumber}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
            Capacity *
          </label>
          <input
            type="number"
            name="capacity"
            id="capacity"
            value={formData.capacity}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            min="1"
          />
        </div>

        <div>
          <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700">
            Device ID *
          </label>
          <input
            type="text"
            name="deviceId"
            id="deviceId"
            value={formData.deviceId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="stationId" className="block text-sm font-medium text-gray-700">
            Station *
          </label>
          <select
            name="stationId"
            id="stationId"
            value={formData.stationId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select a station</option>
            {stations.map((station) => (
              <option key={station._id} value={station._id}>
                {station.name} - {station.address}
              </option>
            ))}
          </select>
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="MAINTENANCE">Maintenance</option>
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          {bus ? 'Update' : 'Create'} Bus
        </button>
      </div>
    </form>
  );
};

export default BusForm; 