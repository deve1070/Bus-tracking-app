import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Bus, Clock, Users, MapPin, ArrowLeft } from 'lucide-react';
import api from '../../../services/api';

interface BusDetails {
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
      _id: string;
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
}

const BusDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bus, setBus] = useState<BusDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBusDetails();
  }, [id]);

  const fetchBusDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/buses/${id}`);
      setBus(response.data);
    } catch (error: any) {
      console.error('Error fetching bus details:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch bus details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE') => {
    if (!bus) return;
    
    try {
      setUpdating(true);
      await api.put(`/buses/${bus._id}`, { status: newStatus });
      setBus({ ...bus, status: newStatus });
      toast.success('Bus status updated successfully');
    } catch (error: any) {
      console.error('Error updating bus status:', error);
      toast.error(error.response?.data?.message || 'Failed to update bus status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !bus) {
    return (
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-12 sm:px-6 text-center">
              <Bus className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
              <p className="mt-1 text-sm text-gray-500">{error || 'Bus not found'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/station-admin/buses')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Buses
          </button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Bus Details
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Bus #{bus.busNumber} - Route {bus.routeNumber}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={bus.status}
                  onChange={(e) => handleStatusUpdate(e.target.value as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE')}
                  disabled={updating}
                  className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Driver</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {bus.driverId ? `${bus.driverId.firstName} ${bus.driverId.lastName}` : 'Not Assigned'}
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Current Station</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {bus.currentStationId?.name || 'Not at station'}
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Passenger Count</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {bus.currentPassengerCount} / {bus.capacity}
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Schedule</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div>Departure: {new Date(bus.schedule.departureTime).toLocaleTimeString()}</div>
                  <div>Arrival: {new Date(bus.schedule.arrivalTime).toLocaleTimeString()}</div>
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Route Stations</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="space-y-2">
                    {bus.route.stations.map((station, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${
                          station._id === bus.currentStationId?._id ? 'bg-green-500' : 'bg-gray-300'
                        } mr-2`} />
                        <span>{station.name}</span>
                      </div>
                    ))}
                  </div>
                </dd>
              </div>

              {bus.trackingData && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Tracking Data</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Speed:</span> {bus.trackingData.speed} km/h
                      </div>
                      <div>
                        <span className="font-medium">Heading:</span> {bus.trackingData.heading}°
                      </div>
                      <div>
                        <span className="font-medium">Last Update:</span>{' '}
                        {new Date(bus.trackingData.lastUpdate).toLocaleString()}
                      </div>
                    </div>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusDetails; 