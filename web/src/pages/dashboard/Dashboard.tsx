import React from 'react';
import { ChevronUp, ChevronDown, Users, Bus, Map, AlertCircle } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import LineChart from '../../components/charts/LineChart';
import BusStatusTable from '../../components/tables/BusStatusTable';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          <select className="border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-md text-sm flex items-center">
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Passengers" 
          value="24,532"
          change="+12%"
          isPositive={true}
          icon={<Users className="text-blue-500" />}
        />
        <StatCard
          title="Active Buses"
          value="42/48"
          change="-2"
          isPositive={false}
          icon={<Bus className="text-green-500" />}
        />
        <StatCard
          title="Stations"
          value="18"
          change="0"
          isNeutral={true}
          icon={<Map className="text-amber-500" />}
        />
        <StatCard
          title="Alerts"
          value="3"
          change="+1"
          isPositive={false}
          icon={<AlertCircle className="text-red-500" />}
        />
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ridership Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Ridership Trends</h2>
          <LineChart />
        </div>

        {/* Recent Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Alerts</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-3 py-2">
              <p className="text-sm font-medium">Bus 103 breakdown</p>
              <p className="text-xs text-gray-500">10 minutes ago</p>
            </div>
            <div className="border-l-4 border-amber-500 pl-3 py-2">
              <p className="text-sm font-medium">Heavy traffic on Route 7</p>
              <p className="text-xs text-gray-500">25 minutes ago</p>
            </div>
            <div className="border-l-4 border-amber-500 pl-3 py-2">
              <p className="text-sm font-medium">Delay at Central Station</p>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bus Status Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Bus Status</h2>
        <BusStatusTable />
      </div>
    </div>
  );
};

export default Dashboard;