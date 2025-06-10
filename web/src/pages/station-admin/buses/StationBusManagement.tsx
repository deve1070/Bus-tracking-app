import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Bus, RefreshCw, Clock, Users, MapPin, Edit } from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

interface StationBus {
  _id: string;
  busNumber: string;
  routeNumber: string;
  capacity: number;
  deviceId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  driverId?: {
    firstName: string;
    lastName: string;
  };
  currentStationId?: {
    name: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
    address: string;
  };
  route: {
    stations: Array<{
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
  currentPassengerCount: number;
  trackingData?: {
    speed: number;
    heading: number;
    lastUpdate: Date;
  };
  currentLocation: {
    type: string;
    coordinates: [number, number];
  };
}

const StationBusManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [buses, setBuses] = useState<StationBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError('User not loaded');
      return;
    }
    if (!user.stationId) {
      setLoading(false);
      setError('No station assigned to this user');
      return;
    }
    fetchStationBuses();
  }, [user]);

  const fetchStationBuses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/buses/station');
      setBuses(response.data);
    } catch (error: any) {
      console.error('Error fetching station buses:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch station buses';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStationBuses();
  };

  const handleStatusUpdate = async (busId: string, newStatus: string) => {
    try {
      await api.put(`/buses/${busId}/status`, { status: newStatus });
      toast.success('Bus status updated successfully');
      fetchStationBuses();
    } catch (error: any) {
      console.error('Error updating bus status:', error);
      toast.error(error.response?.data?.message || 'Failed to update bus status');
    }
  };

  const handleUpdate = (busId: string) => {
    navigate(`/station-admin/buses/update/${busId}`);
  };

  const handleEdit = (busId: string) => {
    navigate(`/station-admin/buses/${busId}/edit`);
  };

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        bus.routeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (bus.driverId && `${bus.driverId.firstName} ${bus.driverId.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || bus.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-12 sm:px-6 text-center">
              <Bus className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Station Buses</h1>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by bus number, route, or driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredBuses.map((bus) => (
              <li key={bus._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Bus className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-indigo-600">Bus #{bus.busNumber}</div>
                        <div className="text-sm text-gray-500">Route: {bus.routeNumber}</div>
                        <div className="text-sm text-gray-500">
                          Status: <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bus.status)}`}>
                            {bus.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {bus.currentPassengerCount}/{bus.capacity}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(bus.schedule.departureTime).toLocaleTimeString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {bus.currentStationId?.name || 'Not at station'}
                      </div>
                      <div className="flex space-x-2">
                        <select
                          value={bus.status}
                          onChange={(e) => handleStatusUpdate(bus._id, e.target.value as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE')}
                          className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="MAINTENANCE">Maintenance</option>
                        </select>
                        <button
                          onClick={() => handleUpdate(bus._id)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleEdit(bus._id)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StationBusManagement; 