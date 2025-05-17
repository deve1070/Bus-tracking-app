import React, { useState } from 'react';
import { Plus, Search, Bus, Edit, Trash2, MoreVertical } from 'lucide-react';
import BusForm from './BusForm';

interface Bus {
  id: number;
  plateNumber: string;
  model: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'out_of_service';
  lastMaintenance: string;
  currentRoute?: string;
  driver?: string;
}

// Sample data
const initialBuses: Bus[] = [
  {
    id: 1,
    plateNumber: 'ABC123',
    model: 'Mercedes-Benz O500',
    capacity: 50,
    status: 'active',
    lastMaintenance: '2024-02-15',
    currentRoute: 'Route 1',
    driver: 'John Doe',
  },
  {
    id: 2,
    plateNumber: 'XYZ789',
    model: 'Volvo B7R',
    capacity: 45,
    status: 'active',
    lastMaintenance: '2024-02-10',
    currentRoute: 'Route 2',
    driver: 'Jane Smith',
  },
];

const BusManagement: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>(initialBuses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('');

  const handleAddBus = () => {
    setSelectedBus(undefined);
    setIsModalOpen(true);
  };

  const handleEditBus = (bus: Bus) => {
    setSelectedBus(bus);
    setIsModalOpen(true);
  };

  const handleDeleteBus = async (busId: number) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        const response = await fetch(`/api/buses/${busId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setBuses(buses.filter(bus => bus.id !== busId));
        } else {
          console.error('Failed to delete bus');
        }
      } catch (error) {
        console.error('An error occurred while deleting bus:', error);
      }
    }
  };

  const handleSubmit = async (busData: Omit<Bus, 'id'>) => {
    try {
      if (selectedBus) {
        // Update existing bus
        const response = await fetch(`/api/buses/${selectedBus.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(busData),
        });

        if (response.ok) {
          const updatedBus = await response.json();
          setBuses(buses.map(bus =>
            bus.id === selectedBus.id ? updatedBus : bus
          ));
        }
      } else {
        // Add new bus
        const response = await fetch('/api/buses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(busData),
        });

        if (response.ok) {
          const newBus = await response.json();
          setBuses([...buses, newBus]);
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('An error occurred while saving bus:', error);
    }
  };

  const filteredBuses = buses
    .filter(bus => {
      const matchesSearch = bus.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bus.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (bus.driver?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesStatus = !statusFilter || bus.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortBy) return 0;
      switch (sortBy) {
        case 'plateNumber':
          return a.plateNumber.localeCompare(b.plateNumber);
        case 'capacity':
          return b.capacity - a.capacity;
        case 'lastMaintenance':
          return new Date(b.lastMaintenance).getTime() - new Date(a.lastMaintenance).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bus Management</h1>
        <button
          onClick={handleAddBus}
          className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-md text-sm flex items-center"
        >
          <Plus size={16} className="mr-2" />
          <span>Add Bus</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search buses..."
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
            <option value="out_of_service">Out of Service</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Sort By</option>
            <option value="plateNumber">Plate Number</option>
            <option value="capacity">Capacity</option>
            <option value="lastMaintenance">Last Maintenance</option>
          </select>
        </div>
      </div>

      {/* Buses Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bus Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Route
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Maintenance
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBuses.map((bus) => (
                <tr key={bus.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bus className="h-5 w-5 text-blue-700" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{bus.plateNumber}</div>
                        <div className="text-xs text-gray-500">{bus.model} - {bus.capacity} seats</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bus.driver || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bus.currentRoute || 'Not Assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      bus.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : bus.status === 'maintenance' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {bus.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(bus.lastMaintenance).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <button
                        onClick={() => handleEditBus(bus)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteBus(bus.id)}
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
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredBuses.length}</span> of{' '}
                <span className="font-medium">{filteredBuses.length}</span> buses
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Bus Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-lg font-medium mb-4">
              {selectedBus ? 'Edit Bus' : 'Add New Bus'}
            </h2>
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