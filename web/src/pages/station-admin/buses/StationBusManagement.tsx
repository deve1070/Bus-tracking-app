import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface StationBus {
  id: string;
  plateNumber: string;
  route: string;
  status: 'arrived' | 'departed' | 'delayed' | 'cancelled';
  scheduledArrival: string;
  actualArrival?: string;
  scheduledDeparture: string;
  actualDeparture?: string;
  driver: string;
  passengers: number;
}

const StationBusManagement: React.FC = () => {
  const [buses, setBuses] = useState<StationBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchStationBuses();
  }, []);

  const fetchStationBuses = async () => {
    try {
      const response = await fetch('/api/station/buses');
      if (response.ok) {
        const data = await response.json();
        setBuses(data);
      } else {
        setError('Failed to fetch bus data');
      }
    } catch (error) {
      setError('An error occurred while fetching bus data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (busId: string, newStatus: StationBus['status']) => {
    try {
      const response = await fetch(`/api/station/buses/${busId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchStationBuses();
      } else {
        setError('Failed to update bus status');
      }
    } catch (error) {
      setError('An error occurred while updating bus status');
    }
  };

  const getStatusColor = (status: StationBus['status']) => {
    switch (status) {
      case 'arrived':
        return 'bg-green-100 text-green-800';
      case 'departed':
        return 'bg-blue-100 text-blue-800';
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = bus.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        bus.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        bus.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || bus.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Bus Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and track buses at your station
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mt-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search buses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="arrived">Arrived</option>
          <option value="departed">Departed</option>
          <option value="delayed">Delayed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Buses Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Bus
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Route
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Schedule
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Driver
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Passengers
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredBuses.map((bus) => (
                    <tr key={bus.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {bus.plateNumber}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {bus.route}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bus.status)}`}>
                          {bus.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div>Arrival: {bus.actualArrival || bus.scheduledArrival}</div>
                        <div>Departure: {bus.actualDeparture || bus.scheduledDeparture}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {bus.driver}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {bus.passengers}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <select
                          value={bus.status}
                          onChange={(e) => handleStatusUpdate(bus.id, e.target.value as StationBus['status'])}
                          className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="arrived">Mark as Arrived</option>
                          <option value="departed">Mark as Departed</option>
                          <option value="delayed">Mark as Delayed</option>
                          <option value="cancelled">Mark as Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationBusManagement; 