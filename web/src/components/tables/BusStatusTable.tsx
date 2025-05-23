import React from 'react';
import { Circle, MoreVertical } from 'lucide-react';

// Sample data
const buses = [
  { id: 'BUS-001', route: 'Downtown - Airport', driver: 'John Smith', status: 'active', passengers: 32, lastLocation: 'Central Station', lastUpdated: '2 mins ago' },
  { id: 'BUS-002', route: 'Westside Loop', driver: 'Maria Johnson', status: 'active', passengers: 28, lastLocation: 'Market Square', lastUpdated: '1 min ago' },
  { id: 'BUS-003', route: 'East Express', driver: 'David Brown', status: 'active', passengers: 18, lastLocation: 'Tech Hub', lastUpdated: '5 mins ago' },
  { id: 'BUS-004', route: 'North Route', driver: 'James Wilson', status: 'maintenance', passengers: 0, lastLocation: 'North Depot', lastUpdated: '3 hours ago' },
  { id: 'BUS-005', route: 'South Beach', driver: 'Sarah Davis', status: 'active', passengers: 22, lastLocation: 'Ocean Drive', lastUpdated: '4 mins ago' },
];

const BusStatusTable: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'maintenance':
        return 'text-amber-500';
      case 'out-of-service':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
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
              Driver
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Passengers
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Location
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Updated
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {buses.map((bus) => (
            <tr key={bus.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {bus.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {bus.route}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {bus.driver}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center">
                  <Circle size={8} className={getStatusColor(bus.status)} fill="currentColor" />
                  <span className="ml-2 capitalize">{bus.status}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {bus.passengers}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {bus.lastLocation}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {bus.lastUpdated}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-gray-400 hover:text-gray-500">
                  <MoreVertical size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BusStatusTable;