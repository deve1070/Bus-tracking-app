import React, { useState, useEffect } from 'react';
import { Search, Users, TrendingUp, Clock } from 'lucide-react';

interface Passenger {
  id: string;
  name: string;
  ticketNumber: string;
  destination: string;
  status: 'waiting' | 'boarding' | 'departed';
  arrivalTime: string;
  departureTime: string;
}

interface PassengerStats {
  totalWaiting: number;
  totalBoarding: number;
  totalDeparted: number;
  peakHour: string;
}

const PassengerManagement: React.FC = () => {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [stats, setStats] = useState<PassengerStats>({
    totalWaiting: 0,
    totalBoarding: 0,
    totalDeparted: 0,
    peakHour: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPassengerData();
  }, []);

  const fetchPassengerData = async () => {
    try {
      const [passengersResponse, statsResponse] = await Promise.all([
        fetch('/api/station/passengers'),
        fetch('/api/station/passengers/stats')
      ]);

      if (passengersResponse.ok && statsResponse.ok) {
        const [passengersData, statsData] = await Promise.all([
          passengersResponse.json(),
          statsResponse.json()
        ]);
        setPassengers(passengersData);
        setStats(statsData);
      } else {
        setError('Failed to fetch passenger data');
      }
    } catch (error) {
      setError('An error occurred while fetching passenger data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (passengerId: string, newStatus: Passenger['status']) => {
    try {
      const response = await fetch(`/api/station/passengers/${passengerId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchPassengerData();
      } else {
        setError('Failed to update passenger status');
      }
    } catch (error) {
      setError('An error occurred while updating passenger status');
    }
  };

  const getStatusColor = (status: Passenger['status']) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'boarding':
        return 'bg-blue-100 text-blue-800';
      case 'departed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPassengers = passengers.filter(passenger => {
    const matchesSearch = passenger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        passenger.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        passenger.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || passenger.status === statusFilter;
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
          <h1 className="text-2xl font-semibold text-gray-900">Passenger Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track and manage passengers at your station
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Waiting</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalWaiting}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Boarding</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalBoarding}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Departed</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalDeparted}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Peak Hour</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.peakHour}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search passengers..."
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
          <option value="waiting">Waiting</option>
          <option value="boarding">Boarding</option>
          <option value="departed">Departed</option>
        </select>
      </div>

      {/* Passengers Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Passenger
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Ticket
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Destination
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Schedule
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredPassengers.map((passenger) => (
                    <tr key={passenger.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {passenger.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {passenger.ticketNumber}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {passenger.destination}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(passenger.status)}`}>
                          {passenger.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div>Arrival: {passenger.arrivalTime}</div>
                        <div>Departure: {passenger.departureTime}</div>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <select
                          value={passenger.status}
                          onChange={(e) => handleStatusUpdate(passenger.id, e.target.value as Passenger['status'])}
                          className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="waiting">Mark as Waiting</option>
                          <option value="boarding">Mark as Boarding</option>
                          <option value="departed">Mark as Departed</option>
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

export default PassengerManagement; 