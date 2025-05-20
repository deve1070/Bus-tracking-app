import React, { useState } from 'react';
import { Plus, Search, MapPin, Edit, Trash2, MoreVertical } from 'lucide-react';
import StationForm from './StationForm';

interface Station {
  id: number;
  name: string;
  location: string;
  status: 'active' | 'maintenance' | 'closed';
  capacity: number;
  facilities: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  buses: number;
  activeRoutes: number;
}

// Sample data
const initialStations: Station[] = [
  {
    id: 1,
    name: 'Central Station',
    location: 'Downtown',
    status: 'active',
    capacity: 1000,
    facilities: ['Parking', 'Restrooms', 'Waiting Area', 'WiFi'],
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
    buses: 8,
    activeRoutes: 4,
  },
  {
    id: 2,
    name: 'North Terminal',
    location: 'North District',
    status: 'active',
    capacity: 800,
    facilities: ['Parking', 'Restrooms', 'Waiting Area', 'Ticket Counter'],
    coordinates: { latitude: 40.7589, longitude: -73.9851 },
    buses: 6,
    activeRoutes: 3,
  },
  // ... other stations
];

const StationManagement: React.FC = () => {
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('');

  const handleAddStation = () => {
    setSelectedStation(undefined);
    setIsModalOpen(true);
  };

  const handleEditStation = (station: Station) => {
    setSelectedStation(station);
    setIsModalOpen(true);
  };

  const handleDeleteStation = async (stationId: number) => {
    if (window.confirm('Are you sure you want to delete this station?')) {
      try {
        // TODO: Implement API call to backend
        const response = await fetch(`/api/stations/${stationId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setStations(stations.filter(station => station.id !== stationId));
        } else {
          console.error('Failed to delete station');
        }
      } catch (error) {
        console.error('An error occurred while deleting station:', error);
      }
    }
  };

  const handleSubmit = async (stationData: Omit<Station, 'id' | 'buses' | 'activeRoutes'>) => {
    try {
      if (selectedStation) {
        // Update existing station
        const response = await fetch(`/api/stations/${selectedStation.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(stationData),
        });

        if (response.ok) {
          const updatedStation = await response.json();
          setStations(stations.map(station =>
            station.id === selectedStation.id ? { ...updatedStation, buses: station.buses, activeRoutes: station.activeRoutes } : station
          ));
        }
      } else {
        // Add new station
        const response = await fetch('/api/stations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(stationData),
        });

        if (response.ok) {
          const newStation = await response.json();
          setStations([...stations, { ...newStation, buses: 0, activeRoutes: 0 }]);
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('An error occurred while saving station:', error);
    }
  };

  const filteredStations = stations
    .filter(station => {
      const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          station.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || station.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortBy) return 0;
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'buses':
          return b.buses - a.buses;
        case 'routes':
          return b.activeRoutes - a.activeRoutes;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Station Management</h1>
        <button
          onClick={handleAddStation}
          className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-md text-sm flex items-center"
        >
          <Plus size={16} className="mr-2" />
          <span>Add Station</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search stations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="closed">Closed</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Sort By</option>
            <option value="name">Name</option>
            <option value="buses">Number of Buses</option>
            <option value="routes">Active Routes</option>
          </select>
        </div>
      </div>

      {/* Stations Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Station Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buses
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Routes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStations.map((station) => (
                <tr key={station.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-blue-700" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{station.name}</div>
                        <div className="text-xs text-gray-500">ID: ST-{String(station.id).padStart(3, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {station.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {station.buses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {station.activeRoutes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      station.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : station.status === 'maintenance' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {station.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <button
                        onClick={() => handleEditStation(station)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteStation(station.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredStations.length}</span> of{' '}
                <span className="font-medium">{filteredStations.length}</span> stations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Station Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-lg font-medium mb-4">
              {selectedStation ? 'Edit Station' : 'Add New Station'}
            </h2>
            <StationForm
              station={selectedStation}
              onSubmit={handleSubmit}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StationManagement;