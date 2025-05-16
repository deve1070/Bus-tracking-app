import React from 'react';
import { Bus, Filter, Plus } from 'lucide-react';

const BusManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bus Management</h1>
        <button className="bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-800">
          <Plus size={20} className="mr-2" />
          Add New Bus
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search buses..."
                className="border-0 focus:ring-0 text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="flex space-x-2">
              <select className="text-sm border-gray-300 rounded-md">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="outOfService">Out of Service</option>
              </select>
              <select className="text-sm border-gray-300 rounded-md">
                <option value="">All Routes</option>
                <option value="downtown">Downtown Route</option>
                <option value="express">Express Route</option>
                <option value="circular">Circular Route</option>
              </select>
            </div>
          </div>
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
                  Driver
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Maintenance
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3].map((_, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700">
                    BUS-{String(index + 1).padStart(3, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Downtown Route
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    John Doe
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2024-03-01
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-700 hover:text-blue-900">Edit</button>
                    <span className="mx-2">|</span>
                    <button className="text-red-700 hover:text-red-900">Disable</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing 1 to 3 of 3 entries
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Fleet Status</h3>
            <Bus size={24} className="text-blue-700" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Buses</span>
              <span className="font-medium">25</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active</span>
              <span className="font-medium text-green-600">20</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Maintenance</span>
              <span className="font-medium text-yellow-600">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Out of Service</span>
              <span className="font-medium text-red-600">2</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Maintenance Schedule</h3>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="font-medium text-yellow-800">BUS-004</div>
              <div className="text-sm text-yellow-600">Due in 2 days</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="font-medium text-yellow-800">BUS-007</div>
              <div className="text-sm text-yellow-600">Due in 5 days</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Recent Activities</h3>
          <div className="space-y-3">
            <div className="text-sm">
              <div className="font-medium">BUS-002 maintenance completed</div>
              <div className="text-gray-500">2 hours ago</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">BUS-005 assigned to new route</div>
              <div className="text-gray-500">5 hours ago</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">BUS-001 reported issue</div>
              <div className="text-gray-500">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusManagement;