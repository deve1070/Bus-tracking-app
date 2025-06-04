import React, { useState, useEffect } from 'react';
import { Bus, RefreshCw } from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

interface Bus {
  _id: string;
  busNumber: string;
  routeNumber: string;
  currentStationId?: string;
  status: string;
  capacity: number;
  currentPassengerCount: number;
  schedule: {
    departureTime: string;
    arrivalTime: string;
  };
}

const StationAdminView: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    console.log('User data:', user);
    if (!user?.stationId) {
      setError('You are not assigned to any station. Please contact the administrator.');
      setLoading(false);
      return;
    }
    fetchStationBuses();
  }, [user]);

  const fetchStationBuses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching buses for station:', user?.stationId);
      
      const response = await api.get('/buses');
      console.log('All buses:', response.data);
      
      // Log each bus's station ID for debugging
      response.data.forEach((bus: Bus) => {
        console.log(`Bus ${bus.busNumber} station ID:`, bus.currentStationId);
      });

      const stationBuses = response.data.filter((bus: Bus) => {
        // Convert both IDs to strings for comparison
        const busStationId = String(bus.currentStationId);
        const userStationId = String(user?.stationId);
        const matches = busStationId === userStationId;
        console.log(`Bus ${bus.busNumber} station ID: ${busStationId}, User station ID: ${userStationId}, Matches: ${matches}`);
        return matches;
      });
      
      console.log('Filtered station buses:', stationBuses);
      setBuses(stationBuses);
    } catch (err) {
      console.error('Error in fetchStationBuses:', err);
      setError('Failed to fetch buses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStationBuses();
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
      <div className="py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <Bus className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Station Assigned</h3>
            <p className="mt-1 text-sm text-gray-500">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Station Buses
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              View and manage buses assigned to your station
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Station ID: {user?.stationId}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="border-t border-gray-200">
          {buses.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
              {buses.map((bus) => (
                <div
                  key={bus._id}
                  className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                        <Bus className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">
                          Bus {bus.busNumber}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Route: {bus.routeNumber}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <p className="mt-1 text-sm text-gray-900">{bus.status}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Capacity</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {bus.currentPassengerCount}/{bus.capacity}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">Schedule</p>
                      <div className="mt-1 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Departure</p>
                          <p className="text-sm text-gray-900">
                            {new Date(bus.schedule.departureTime).toLocaleTimeString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Arrival</p>
                          <p className="text-sm text-gray-900">
                            {new Date(bus.schedule.arrivalTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bus className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No buses assigned</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are currently no buses assigned to your station.
              </p>
              <button
                onClick={handleRefresh}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationAdminView; 