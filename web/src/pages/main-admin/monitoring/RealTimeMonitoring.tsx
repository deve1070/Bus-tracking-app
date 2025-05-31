import React, { useState } from 'react';
import { Bus, Clock, MapPin, RefreshCw, Filter } from 'lucide-react';
import RealTimeMapVisualization from '../../station-admin/monitoring/components/RealTimeMapVisualization';

// Sample bus data
const busData = [
  { id: 'BUS-001', position: { lat: 9.0227, lng: 38.7468 }, route: 'Downtown - Airport', status: 'active', speed: 35, passengers: 32, lastUpdated: '1 min ago' },
  { id: 'BUS-002', position: { lat: 9.0300, lng: 38.7550 }, route: 'Westside Loop', status: 'active', speed: 28, passengers: 25, lastUpdated: '2 mins ago' },
  { id: 'BUS-003', position: { lat: 9.0150, lng: 38.7400 }, route: 'East Express', status: 'active', speed: 42, passengers: 18, lastUpdated: '1 min ago' },
  { id: 'BUS-004', position: { lat: 9.0350, lng: 38.7300 }, route: 'North Route', status: 'maintenance', speed: 0, passengers: 0, lastUpdated: '30 mins ago' },
  { id: 'BUS-005', position: { lat: 9.0100, lng: 38.7600 }, route: 'South Beach', status: 'active', speed: 30, passengers: 22, lastUpdated: '3 mins ago' },
];

// Sample station data
const stationData = [
  { id: 'ST-001', name: 'Central Station', position: { lat: 9.0227, lng: 38.7468 } },
  { id: 'ST-002', name: 'North Terminal', position: { lat: 9.0350, lng: 38.7500 } },
  { id: 'ST-003', name: 'East Hub', position: { lat: 9.0250, lng: 38.7650 } },
  { id: 'ST-004', name: 'West Station', position: { lat: 9.0200, lng: 38.7300 } },
  { id: 'ST-005', name: 'South Terminal', position: { lat: 9.0100, lng: 38.7450 } },
];

// Mock Google Maps API - replace with actual API key in a production environment
const googleMapsApiKey = "YOUR_API_KEY_HERE";

const RealTimeMonitoring: React.FC = () => {
  const [showStations, setShowStations] = useState(true);
  const [filteredRoutes, setFilteredRoutes] = useState<string[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const refreshData = () => {
    // In a real app, this would fetch new data from the API
    setLastRefreshed(new Date());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Real-Time Monitoring</h1>
        <div className="flex space-x-2">
          <div className="bg-white rounded-md shadow-sm border border-gray-200 px-3 py-2 flex items-center">
            <Clock size={16} className="text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Last updated: {lastRefreshed.toLocaleTimeString()}</span>
          </div>
          <button 
            onClick={refreshData}
            className="bg-white hover:bg-gray-50 text-blue-700 p-2 rounded-md border border-gray-200 shadow-sm"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Control Panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Filter size={18} className="mr-2 text-blue-700" />
              Filters
            </h2>
            <div className="space-y-3">
              <div>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    defaultChecked={showStations} 
                    onChange={() => setShowStations(!showStations)}
                    className="rounded text-blue-700 focus:ring-blue-500"
                  />
                  <span>Show Stations</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bus Status</label>
                <div className="space-y-1">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded text-blue-700 focus:ring-blue-500" />
                    <span>Active</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded text-blue-700 focus:ring-blue-500" />
                    <span>Maintenance</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded text-blue-700 focus:ring-blue-500" />
                    <span>Out of Service</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Routes</label>
                <select className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="">All Routes</option>
                  <option value="downtown">Downtown - Airport</option>
                  <option value="westside">Westside Loop</option>
                  <option value="east">East Express</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Bus Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Buses:</span>
                <span className="font-medium">48</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active:</span>
                <span className="font-medium text-green-600">42</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Maintenance:</span>
                <span className="font-medium text-amber-600">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Out of Service:</span>
                <span className="font-medium text-red-600">1</span>
              </div>
              <div className="border-t border-gray-200 my-2 pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Passengers:</span>
                  <span className="font-medium">1,254</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="md:col-span-3">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200">
              <RealTimeMapVisualization />
            </div>
          </div>
        </div>
      </div>

      {/* Bus List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium">Active Buses</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bus ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Speed
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Passengers
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {busData.map((bus) => (
                <tr key={bus.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700">
                    {bus.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bus.route}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      bus.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bus.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bus.speed} km/h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bus.passengers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bus.lastUpdated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMonitoring;