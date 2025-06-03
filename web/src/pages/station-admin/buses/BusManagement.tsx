import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const StationBuses: React.FC = () => {
  const navigate = useNavigate();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      console.log('Fetching station buses...');
      const response = await api.get('/buses/station');
      console.log('Received response:', response.data);
      setBuses(response.data);
    } catch (error: any) {
      console.error('Error fetching buses:', error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || 'Failed to fetch buses';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (busId: string) => {
    navigate(`/station-admin/buses/update/${busId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Station Buses</h1>
        <div className="mt-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {buses.map((bus) => (
                <li key={bus._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-indigo-600">Bus #{bus.busNumber}</div>
                          <div className="text-sm text-gray-500">Route: {bus.routeNumber}</div>
                          <div className="text-sm text-gray-500">
                            Status: <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              bus.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              bus.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {bus.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500">
                          <div>Capacity: {bus.capacity}</div>
                          <div>Device ID: {bus.deviceId}</div>
                        </div>
                        <button
                          onClick={() => handleUpdate(bus._id)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Update
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

export default StationBuses; 