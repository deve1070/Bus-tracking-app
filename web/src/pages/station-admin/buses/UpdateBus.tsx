import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

interface Bus {
  _id: string;
  busNumber: string;
  routeNumber: string;
  capacity: number;
  deviceId: string;
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
}

const UpdateBus: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bus, setBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    busNumber: '',
    routeNumber: '',
    capacity: 0,
    deviceId: '',
    status: 'INACTIVE' as const,
    schedule: {
      departureTime: '',
      arrivalTime: ''
    },
    route: {
      stations: [] as string[],
      estimatedTime: 0
    }
  });

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const response = await api.get(`/buses/${id}`);
        setBus(response.data);
        setFormData({
          busNumber: response.data.busNumber,
          routeNumber: response.data.routeNumber,
          capacity: response.data.capacity,
          deviceId: response.data.deviceId,
          status: response.data.status,
          schedule: {
            departureTime: response.data.schedule.departureTime,
            arrivalTime: response.data.schedule.arrivalTime
          },
          route: {
            stations: response.data.route.stations || [],
            estimatedTime: response.data.route.estimatedTime
          }
        });
      } catch (error) {
        toast.error('Failed to fetch bus details');
        console.error('Error fetching bus:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBus();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        status: formData.status.toUpperCase()
      };
      
      await api.put(`/buses/${id}`, submitData);
      toast.success('Bus updated successfully');
      navigate('/station-admin/buses');
    } catch (error) {
      toast.error('Failed to update bus');
      console.error('Error updating bus:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) : value
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Update Bus</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
            onClick={() => navigate('/station-admin/buses')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update Bus
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateBus; 