import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import DataTable from '../../../components/common/DataTable';
import StationForm from './StationForm';
import api from '../../../services/api';

interface Station {
  _id?: string;
  name: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  description?: string;
  adminId?: string;
}

const StationManagement: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await api.get('/stations');
      setStations(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch stations');
      console.error('Error fetching stations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStation = () => {
    setSelectedStation(null);
    setIsModalOpen(true);
  };

  const handleEditStation = (station: Station) => {
    setSelectedStation(station);
    setIsModalOpen(true);
  };

  const handleDeleteStation = async (station: Station) => {
    if (!station._id) return;
    
    if (window.confirm('Are you sure you want to delete this station?')) {
      try {
        await api.delete(`/stations/${station._id}`);
        fetchStations();
      } catch (err) {
        setError('Failed to delete station');
        console.error('Error deleting station:', err);
      }
    }
  };

  const handleSubmit = async (stationData: Omit<Station, '_id'>) => {
    try {
      if (selectedStation) {
        await api.put(`/stations/${selectedStation._id}`, stationData);
      } else {
        await api.post('/stations', stationData);
      }
      setIsModalOpen(false);
      fetchStations();
    } catch (err) {
      setError('Failed to save station');
      console.error('Error saving station:', err);
    }
  };

  const columns = [
    {
      header: 'Station Name',
      accessor: 'name',
      render: (value: string, row: Station) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-blue-700" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{row.address}</div>
          </div>
        </div>
      ),
    },
    { 
      header: 'Location', 
      accessor: 'location',
      render: (value: { coordinates: [number, number] }) => (
        <div className="text-sm text-gray-500">
          {value.coordinates[1].toFixed(6)}, {value.coordinates[0].toFixed(6)}
        </div>
      )
    },
    { 
      header: 'Description', 
      accessor: 'description',
      render: (value: string) => value || 'No description'
    }
  ];

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
        title="Station Management"
        description="Manage and track all stations in the system"
        columns={columns}
        data={stations}
        onAdd={handleAddStation}
        onEdit={handleEditStation}
        onDelete={handleDeleteStation}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {isModalOpen && (
        <StationForm
          station={selectedStation}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default StationManagement;