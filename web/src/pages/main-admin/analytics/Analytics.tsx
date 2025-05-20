import React from 'react';
import { BarChart2, TrendingUp, Users, Clock } from 'lucide-react';
import LineChart from "../../../components/charts/LineChart";

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="flex space-x-3">
          <select className="border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-md text-sm">
            Download Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">$124,563.00</p>
              <p className="text-sm text-green-600 flex items-center mt-2">
                <TrendingUp size={16} className="mr-1" />
                +12.5% from last month
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <BarChart2 className="text-blue-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Rides</p>
              <p className="text-2xl font-bold mt-1">85,242</p>
              <p className="text-sm text-green-600 flex items-center mt-2">
                <TrendingUp size={16} className="mr-1" />
                +8.2% from last month
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Clock className="text-green-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-bold mt-1">24,532</p>
              <p className="text-sm text-green-600 flex items-center mt-2">
                <TrendingUp size={16} className="mr-1" />
                +15.3% from last month
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Users className="text-purple-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Ride Time</p>
              <p className="text-2xl font-bold mt-1">32 mins</p>
              <p className="text-sm text-red-600 flex items-center mt-2">
                <TrendingUp size={16} className="mr-1" />
                -2.4% from last month
              </p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <Clock className="text-amber-700" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Revenue Trends</h2>
          <LineChart />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">User Growth</h2>
          <LineChart />
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Detailed Statistics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Rides
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { route: 'Downtown Express', rides: '12,543', revenue: '$45,678', time: '28 mins', growth: '+12.3%' },
                { route: 'Airport Shuttle', rides: '8,721', revenue: '$32,456', time: '45 mins', growth: '+8.7%' },
                { route: 'University Line', rides: '15,234', revenue: '$28,912', time: '22 mins', growth: '+15.2%' },
                { route: 'Shopping Circuit', rides: '9,876', revenue: '$18,765', time: '35 mins', growth: '+5.8%' },
                { route: 'Beach Route', rides: '7,654', revenue: '$15,432', time: '40 mins', growth: '+9.4%' },
              ].map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.route}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.rides}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.revenue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {item.growth}
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

export default Analytics;