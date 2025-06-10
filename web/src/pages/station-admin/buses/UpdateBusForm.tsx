import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

interface BusSchedule {
  departureTime: string;
  arrivalTime: string;
}

interface Bus {
  _id: string;
  busNumber: string;
  routeNumber: string;
  capacity: number;
  deviceId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  schedule: BusSchedule;
  currentPassengerCount: number;
  stationId?: string;
  currentStationId?: {
    _id: string;
    name: string;
    address: string;
    location: {
      type: string;
      coordinates: number[];
    };
  };
  route?: {
    stations: Array<{
      stationId: string;
      name: string;
      location: {
        type: string;
        coordinates: number[];
      };
      _id: string;
    }>;
    estimatedTime: number;
  };
  currentLocation?: {
    type: string;
    coordinates: number[];
  };
  trackingData?: {
    speed: number;
    heading: number;
    lastUpdate: string;
  };
  isOnRoute?: boolean;
  lastUpdateTime?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

const UpdateBusForm: React.FC = () => {
  const navigate = useNavigate();
  const { busId } = useParams<{ busId: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Bus>>({
    status: 'INACTIVE',
    schedule: {
      departureTime: new Date().toISOString(),
      arrivalTime: new Date().toISOString()
    }
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusData();
  }, [busId]);

  const fetchBusData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/buses/${busId}`);
      setFormData(response.data);
    } catch (error: any) {
      console.error('Error fetching bus data:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch bus data');
      navigate('/station-admin/buses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting bus update with form data:', formData);
    console.log('Current user:', user);

    try {
      // Validate schedule exists
      if (!formData.schedule) {
        setError('Schedule is required');
        return;
      }

      // Validate schedule times
      console.log('Validating schedule times:', {
        departure: formData.schedule.departureTime,
        arrival: formData.schedule.arrivalTime
      });

      if (new Date(formData.schedule.departureTime) >= new Date(formData.schedule.arrivalTime)) {
        setError('Arrival time must be after departure time');
        return;
      }

      // Only send the necessary data
      const updateData = {
        status: formData.status,
        schedule: formData.schedule,
        currentStationId: formData.currentStationId?._id,
        stationId: user?.stationId,
        currentLocation: formData.currentLocation,
        trackingData: formData.trackingData,
        isOnRoute: formData.isOnRoute,
        currentPassengerCount: formData.currentPassengerCount
      };

      console.log('Making API request to update bus:', {
        busId,
        updateData,
        userStationId: user?.stationId,
        busStationId: formData.stationId,
        currentStationId: formData.currentStationId?._id
      });

      const response = await api.put(`/buses/${busId}`, updateData);
      console.log('Bus updated successfully:', response.data);
      toast.success('Bus updated successfully');
      navigate('/station-admin/buses');
    } catch (error: any) {
      console.error('Error updating bus:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.error || 'Failed to update bus');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule!,
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
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Update Bus
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Bus Information</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Update the bus status and schedule.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="departureTime" className="block text-sm font-medium text-gray-700">
                      Departure Time
                    </label>
                    <input
                      type="datetime-local"
                      name="departureTime"
                      id="departureTime"
                      value={formData.schedule?.departureTime?.slice(0, 16) || ''}
                      onChange={handleScheduleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="arrivalTime" className="block text-sm font-medium text-gray-700">
                      Arrival Time
                    </label>
                    <input
                      type="datetime-local"
                      name="arrivalTime"
                      id="arrivalTime"
                      value={formData.schedule?.arrivalTime?.slice(0, 16) || ''}
                      onChange={handleScheduleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/station-admin/buses')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update Bus
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateBusForm; 