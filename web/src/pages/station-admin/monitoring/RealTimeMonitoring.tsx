import React, { useState, useEffect } from 'react';
import { Bus, Clock, MapPin, RefreshCw, Filter } from 'lucide-react';
import RealTimeMapVisualization from './components/RealTimeMapVisualization';
import io from 'socket.io-client';

interface BusData {
  deviceId: string;
  busNumber: string;
  routeNumber: string;
  location: {
    lat: number;
    lng: number;
  };
  speed: number;
  heading: number;
  status: string;
  lastUpdate: string;
}

const RealTimeMonitoring: React.FC = () => {
  const [showStations, setShowStations] = useState(true);
  const [filteredRoutes, setFilteredRoutes] = useState<string[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [busData, setBusData] = useState<Record<string, BusData>>({});
  const [activeBuses, setActiveBuses] = useState(0);
  const [maintenanceBuses, setMaintenanceBuses] = useState(0);
  const [outOfServiceBuses, setOutOfServiceBuses] = useState(0);

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(import.meta.env.VITE_REACT_APP_WS_URL || 'http://localhost:3000');

    // Listen for bus location updates
    socket.on('busLocationUpdate', (data: BusData[]) => {
      const newBusData: Record<string, BusData> = {};
      data.forEach(bus => {
        newBusData[bus.deviceId] = bus;
      });
      setBusData(newBusData);
      setLastRefreshed(new Date());

      // Update bus statistics
      const active = data.filter(bus => bus.status === 'active').length;
      const maintenance = data.filter(bus => bus.status === 'maintenance').length;
      const outOfService = data.filter(bus => bus.status === 'inactive').length;

      setActiveBuses(active);
      setMaintenanceBuses(maintenance);
      setOutOfServiceBuses(outOfService);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const refreshData = () => {
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
                <span className="font-medium">{Object.keys(busData).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active:</span>
                <span className="font-medium text-green-600">{activeBuses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Maintenance:</span>
                <span className="font-medium text-amber-600">{maintenanceBuses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Out of Service:</span>
                <span className="font-medium text-red-600">{outOfServiceBuses}</span>
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
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.values(busData).map((bus) => (
                <tr key={bus.deviceId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700">
                    {bus.busNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bus.routeNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      bus.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : bus.status === 'maintenance'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {bus.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bus.speed} km/h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(bus.lastUpdate).toLocaleTimeString()}
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