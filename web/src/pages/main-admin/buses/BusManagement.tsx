import React, { useState, useEffect } from 'react';
import { Bus } from 'lucide-react';
import DataTable from '../../../components/common/DataTable';
import BusForm from './BusForm';
import api from '../../../services/api';

interface Station {
  _id: string;
  name: string;
  location: string;
}

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

interface Column {
  header: string;
  accessor: string;
  render?: (value: any, row?: Bus) => React.ReactNode;
}

const BusManagement: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [busesResponse, stationsResponse] = await Promise.all([
        api.get('/buses'),
        api.get('/stations')
      ]);
      setBuses(busesResponse.data);
      setStations(stationsResponse.data);
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBus = () => {
    setSelectedBus(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (bus: Bus) => {
    setSelectedBus(bus);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await api.delete(`/buses/${id}`);
        setBuses(buses.filter(bus => bus._id !== id));
      } catch (error) {
        console.error('Error deleting bus:', error);
        setError('Failed to delete bus');
      }
    }
  };

  const handleSave = async (busData: Omit<Bus, '_id'>) => {
    try {
      if (selectedBus) {
        // Update existing bus
        await api.put(`/buses/${selectedBus._id}`, busData);
      } else {
        // Create new bus
        await api.post('/buses', busData);
      }
      
      // Refresh the bus list
      const response = await api.get('/buses');
      setBuses(response.data);
      
      // Close the form and reset selected bus
      setIsFormOpen(false);
      setSelectedBus(undefined);
    } catch (error) {
      console.error('Error saving bus:', error);
      throw error;
    }
  };

  const getStationName = (stationId?: string) => {
    if (!stationId) return 'Not Assigned';
    const station = stations.find(s => s._id === stationId);
    return station ? `${station.name} - ${station.location}` : 'Unknown Station';
  };

  const columns: Column[] = [
    {
      header: 'Bus Number',
      accessor: 'busNumber',
      render: (value: string) => value
    },
    {
      header: 'Route Number',
      accessor: 'routeNumber',
      render: (value: string) => value
    },
    {
      header: 'Capacity',
      accessor: 'capacity',
      render: (value: number) => value
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          value === 'ACTIVE' ? 'bg-green-100 text-green-800' :
          value === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      header: 'Assigned Station',
      accessor: 'currentStationId',
      render: (value: any) => (
        <div>
          {value && value.name ? (
            <div>
              <div className="font-medium">{value.name}</div>
              <div className="text-sm text-gray-500">{value.address}</div>
            </div>
          ) : (
            <span className="text-gray-500">Not Assigned</span>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (value: string, row?: Bus) => row ? (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      ) : null
    }
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
    { value: 'currentStationId', label: 'Station' },
  ];

  const filteredBuses = buses
    .filter(bus => {
      const matchesSearch = 
        bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.routeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getStationName(bus.currentStationId).toLowerCase().includes(searchTerm.toLowerCase());
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
        case 'currentStationId':
          return getStationName(a.currentStationId).localeCompare(getStationName(b.currentStationId));
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
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <DataTable
          columns={columns}
          data={buses}
          title="Bus Management"
          description="Manage and track all buses in the system"
          onAdd={() => {
            setSelectedBus(undefined);
            setIsFormOpen(true);
          }}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          statusOptions={statusOptions}
          sortOptions={sortOptions}
        />
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <BusForm
              bus={selectedBus}
              onSubmit={handleSave}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedBus(undefined);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BusManagement;