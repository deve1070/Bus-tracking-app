import React, { useState, useEffect } from 'react';
import { Bus } from 'lucide-react';
import DataTable from '../../../components/common/DataTable';
import BusForm from './BusForm';
import api from '../../../services/api';

interface Bus {
  _id: string;
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
  currentStationId?: string;
  route: {
    stations: string[];
    estimatedTime: number;
  };
  schedule: {
    departureTime: string;
    arrivalTime: string;
  };
  lastUpdateTime: Date;
  isOnRoute: boolean;
  currentPassengerCount: number;
  trackingData?: {
    speed: number;
    heading: number;
    lastUpdate: Date;
  };
}

const BusManagement: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const response = await api.get('/buses');
      setBuses(response.data);
    } catch (error) {
      setError('Failed to fetch buses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBus = () => {
    setSelectedBus(undefined);
    setIsModalOpen(true);
  };

  const handleEditBus = (bus: Bus) => {
    setSelectedBus(bus);
    setIsModalOpen(true);
  };

  const handleDeleteBus = async (bus: Bus) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await api.delete(`/buses/${bus._id}`);
        setBuses(buses.filter(b => b._id !== bus._id));
      } catch (error) {
        setError('Failed to delete bus');
      }
    }
  };

  const handleSubmit = async (busData: Omit<Bus, '_id'>) => {
    try {
      if (selectedBus) {
        // Update existing bus
        const response = await api.put(`/buses/${selectedBus._id}`, busData);
        setBuses(buses.map(bus =>
          bus._id === selectedBus._id ? response.data : bus
        ));
      } else {
        // Add new bus
        const newBusData = {
          ...busData,
          currentLocation: {
            type: 'Point',
            coordinates: [0, 0] // Default coordinates
          },
          route: {
            stations: [], // Empty array for stations
            estimatedTime: busData.route.estimatedTime || 0
          },
          schedule: {
            departureTime: busData.schedule.departureTime,
            arrivalTime: busData.schedule.arrivalTime
          },
          isOnRoute: false,
          currentPassengerCount: 0,
          lastUpdateTime: new Date(),
          status: 'INACTIVE' // Default status
        };

        const response = await api.post('/buses', newBusData);
        setBuses([...buses, response.data]);
      }
      setIsModalOpen(false);
      setSelectedBus(undefined);
    } catch (error) {
      setError('Failed to save bus');
      console.error('Error saving bus:', error);
    }
  };

  const columns = [
    { header: 'Bus Number', accessor: 'busNumber' },
    { header: 'Route Number', accessor: 'routeNumber' },
    { header: 'Capacity', accessor: 'capacity' },
    {
      header: 'Status',
      accessor: 'status',
      render: (value: string) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          value === 'ACTIVE' 
            ? 'bg-green-100 text-green-800' 
            : value === 'MAINTENANCE' 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      header: 'Current Location',
      accessor: 'currentLocation',
      render: (value: { coordinates: [number, number] }) => (
        <span>
          {value.coordinates[1].toFixed(4)}, {value.coordinates[0].toFixed(4)}
        </span>
      ),
    },
    {
      header: 'Schedule',
      accessor: 'schedule',
      render: (value: { departureTime: string; arrivalTime: string }) => (
        <span>
          {new Date(value.departureTime).toLocaleTimeString()} - {new Date(value.arrivalTime).toLocaleTimeString()}
        </span>
      ),
    },
    {
      header: 'Passengers',
      accessor: 'currentPassengerCount',
      render: (value: number, row: Bus) => (
        <span>
          {value}/{row.capacity}
        </span>
      ),
    },
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  const sortOptions = [
    { value: 'busNumber', label: 'Bus Number' },
    { value: 'routeNumber', label: 'Route Number' },
    { value: 'capacity', label: 'Capacity' },
    { value: 'status', label: 'Status' },
  ];

  const filteredBuses = buses
    .filter(bus => {
      const matchesSearch = 
        bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.routeNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || bus.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortBy) return 0;
      switch (sortBy) {
        case 'busNumber':
          return a.busNumber.localeCompare(b.busNumber);
        case 'routeNumber':
          return a.routeNumber.localeCompare(b.routeNumber);
        case 'capacity':
          return b.capacity - a.capacity;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <DataTable
        title="Bus Management"
        description="Manage and track all buses in the system"
        columns={columns}
        data={filteredBuses}
        onAdd={handleAddBus}
        onEdit={handleEditBus}
        onDelete={handleDeleteBus}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        statusOptions={statusOptions}
        sortOptions={sortOptions}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <BusForm
              bus={selectedBus}
              onSubmit={handleSubmit}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BusManagement;