import React, { useState, useEffect } from 'react';
import { Bus, Users, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

interface StationStats {
  totalBuses: number;
  activeBuses: number;
  totalPassengers: number;
  currentPassengers: number;
  nextArrival: string;
  alerts: number;
}

interface BusData {
  _id: string;
  busNumber: string;
  routeNumber: string;
  status: string;
  currentStationName: string;
  currentPassengerCount: number;
}

const StationAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<StationStats>({
    totalBuses: 0,
    activeBuses: 0,
    totalPassengers: 0,
    currentPassengers: 0,
    nextArrival: '',
    alerts: 0,
  });
  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStationData();
    fetchStationBuses();
  }, []);

  const fetchStationData = async () => {
    try {
      const response = await api.get('/station/stats');
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching station data:', error);
    }
  };

  const fetchStationBuses = async () => {
    try {
      const response = await api.get('/buses/station');
      console.log('Buses response:', response.data);
      if (response.data) {
        setBuses(response.data);
      }
    } catch (error) {
      console.error('Error fetching station buses:', error);
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-2xl font-semibold text-gray-900">Station Dashboard</h1>
        
        {/* Station Statistics */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Active Buses */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-blue-100 rounded-md flex items-center justify-center">
                    <Bus className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Buses</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activeBuses}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Count */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-green-100 rounded-md flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Current Passengers</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.currentPassengers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Next Arrival */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-yellow-100 rounded-md flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Next Arrival</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.nextArrival || 'No upcoming arrivals'}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buses List */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Station Buses</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Station</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passengers</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {buses.map((bus) => (
                  <tr key={bus._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bus.busNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bus.routeNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bus.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        bus.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {bus.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bus.currentStationName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bus.currentPassengerCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationAdminDashboard; 