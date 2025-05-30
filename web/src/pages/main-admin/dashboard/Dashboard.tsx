import React, { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown, Users, Bus, Map, AlertCircle } from 'lucide-react';
import axios from 'axios';
import StatCard from "../../../components/ui/StatCard";
import LineChart from "../../../components/charts/LineChart";
import BusStatusTable from "../../../components/tables/BusStatusTable";
import { DashboardStats, AnalyticsPeriod } from '../../../types/analytics';

const API_URL = 'http://localhost:5000/api';

const Dashboard: React.FC = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>('DAILY');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPassengers: 0,
    activeBuses: 0,
    totalStations: 0,
    alerts: 0,
    ridershipTrend: {
      labels: [],
      data: []
    },
    recentAlerts: [],
    busStatus: []
  });

  useEffect(() => {
    fetchDashboardData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchDashboardData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [period]);

  const calculateInitialAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(`${API_URL}/analytics/calculate-daily`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error calculating initial analytics:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - (period === 'DAILY' ? 1 : period === 'WEEKLY' ? 7 : 30));

      // Fetch analytics data
      const [passengerAnalytics, busAnalytics, stationAnalytics, paymentAnalytics, feedbackAnalytics] = await Promise.all([
        axios.get(`${API_URL}/analytics`, {
          params: {
            type: 'ROUTE',
            period,
            startDate: startDate.toISOString(),
            endDate: today.toISOString()
          },
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/analytics`, {
          params: {
            type: 'BUS',
            period,
            startDate: startDate.toISOString(),
            endDate: today.toISOString()
          },
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/analytics`, {
          params: {
            type: 'STATION',
            period,
            startDate: startDate.toISOString(),
            endDate: today.toISOString()
          },
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/analytics`, {
          params: {
            type: 'PAYMENT',
            period,
            startDate: startDate.toISOString(),
            endDate: today.toISOString()
          },
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/analytics`, {
          params: {
            type: 'FEEDBACK',
            period,
            startDate: startDate.toISOString(),
            endDate: today.toISOString()
          },
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // If no data is available, trigger initial calculation
      if (passengerAnalytics.data.length === 0) {
        await calculateInitialAnalytics();
        // Fetch data again after calculation
        return fetchDashboardData();
      }

      // Process analytics data
      const totalPassengers = passengerAnalytics.data.reduce((sum: number, item: any) => 
        sum + (item.data.metrics.passengerCount || 0), 0);
      
      const activeBuses = busAnalytics.data.filter((item: any) => 
        item.data.metrics.averageSpeed > 0).length;

      const totalStations = stationAnalytics.data.length;

      // Calculate alerts based on feedback and bus status
      const negativeFeedback = feedbackAnalytics.data.reduce((sum: number, item: any) => 
        sum + (item.data.metrics.feedbackCount?.negative || 0), 0);
      
      const delayedBuses = busAnalytics.data.filter((item: any) => 
        item.data.metrics.delayTime > 15).length; // Buses delayed by more than 15 minutes

      const alerts = negativeFeedback + delayedBuses;

      // Prepare ridership trend data
      const ridershipTrend = {
        labels: passengerAnalytics.data.map((item: any) => 
          new Date(item.data.timestamp).toLocaleDateString()),
        data: passengerAnalytics.data.map((item: any) => 
          item.data.metrics.passengerCount || 0)
      };

      // Prepare recent alerts
      const recentAlerts = [
        ...feedbackAnalytics.data
          .filter((item: any) => item.data.metrics.feedbackCount?.negative > 0)
          .map((item: any) => ({
            id: item._id,
            type: 'warning',
            message: `${item.data.metrics.feedbackCount.negative} negative feedback received`,
            timestamp: new Date(item.data.timestamp).toLocaleString()
          })),
        ...busAnalytics.data
          .filter((item: any) => item.data.metrics.delayTime > 15)
          .map((item: any) => ({
            id: item._id,
            type: 'error',
            message: `Bus ${item.data.busId} delayed by ${Math.round(item.data.metrics.delayTime)} minutes`,
            timestamp: new Date(item.data.timestamp).toLocaleString()
          }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5); // Get only the 5 most recent alerts

      // Prepare bus status data
      const busStatus = busAnalytics.data.map((item: any) => ({
        id: item.data.busId,
        route: item.data.routeId,
        status: item.data.metrics.averageSpeed > 0 ? 'active' : 'inactive',
        passengers: item.data.metrics.passengerCount || 0,
        occupancy: item.data.metrics.occupancyRate || 0,
        speed: item.data.metrics.averageSpeed || 0,
        delay: item.data.metrics.delayTime || 0
      }));

      // Update stats
      setStats({
        totalPassengers,
        activeBuses,
        totalStations,
        alerts,
        ridershipTrend,
        recentAlerts,
        busStatus
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // If analytics data is not found, trigger initial calculation
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        await calculateInitialAnalytics();
        // Fetch data again after calculation
        return fetchDashboardData();
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value as AnalyticsPeriod);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          <select 
            value={period}
            onChange={handlePeriodChange}
            className="border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="DAILY">Today</option>
            <option value="WEEKLY">This Week</option>
            <option value="MONTHLY">This Month</option>
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
          value={stats.totalPassengers.toLocaleString()}
          change="+12%"
          isPositive={true}
          icon={<Users className="text-blue-500" />}
          loading={loading}
        />
        <StatCard
          title="Active Buses"
          value={`${stats.activeBuses}`}
          change="-2"
          isPositive={false}
          icon={<Bus className="text-green-500" />}
          loading={loading}
        />
        <StatCard
          title="Stations"
          value={stats.totalStations.toString()}
          change="0"
          isNeutral={true}
          icon={<Map className="text-amber-500" />}
          loading={loading}
        />
        <StatCard
          title="Alerts"
          value={stats.alerts.toString()}
          change="+1"
          isPositive={false}
          icon={<AlertCircle className="text-red-500" />}
          loading={loading}
        />
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ridership Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Ridership Trends</h2>
          <LineChart 
            data={stats.ridershipTrend.data}
            labels={stats.ridershipTrend.labels}
            loading={loading}
          />
        </div>

        {/* Recent Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Alerts</h2>
          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : stats.recentAlerts.length > 0 ? (
              stats.recentAlerts.map((alert) => (
                <div key={alert.id} className={`border-l-4 ${
                  alert.type === 'error' ? 'border-red-500' :
                  alert.type === 'warning' ? 'border-amber-500' :
                  'border-blue-500'
                } pl-3 py-2`}>
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-gray-500">{alert.timestamp}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent alerts</p>
            )}
          </div>
        </div>
      </div>

      {/* Bus Status Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Bus Status</h2>
        <BusStatusTable 
          data={stats.busStatus}
          loading={loading} 
        />
      </div>
    </div>
  );
};

export default Dashboard;