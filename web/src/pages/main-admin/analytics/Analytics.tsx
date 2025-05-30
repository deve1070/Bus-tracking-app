import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../../../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  type: 'ROUTE' | 'BUS' | 'STATION' | 'PAYMENT' | 'FEEDBACK';
  data: {
    routeId?: string;
    busId?: string;
    stationId?: string;
    timestamp: string;
    metrics: {
      passengerCount?: number;
      revenue?: number;
      averageSpeed?: number;
      delayTime?: number;
      occupancyRate?: number;
      feedbackCount?: {
        positive: number;
        negative: number;
        neutral: number;
      };
      paymentStats?: {
        total: number;
        successful: number;
        failed: number;
        averageAmount: number;
      };
    };
  };
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

const Analytics: React.FC = () => {
  const [analyticsType, setAnalyticsType] = useState<'ROUTE' | 'BUS' | 'STATION' | 'PAYMENT' | 'FEEDBACK'>('ROUTE');
  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set default date range to last 7 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAnalytics();
    }
  }, [analyticsType, period, startDate, endDate]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/analytics', {
        params: {
          type: analyticsType,
          period,
          startDate,
          endDate
        }
      });
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    const labels = data.map(item => new Date(item.data.timestamp).toLocaleDateString());
    
    let datasets = [];
    switch (analyticsType) {
      case 'ROUTE':
        datasets = [
          {
            label: 'Passenger Count',
            data: data.map(item => item.data.metrics.passengerCount || 0),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Revenue',
            data: data.map(item => item.data.metrics.revenue || 0),
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ];
        break;
      case 'BUS':
        datasets = [
          {
            label: 'Passenger Count',
            data: data.map(item => item.data.metrics.passengerCount || 0),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Occupancy Rate (%)',
            data: data.map(item => item.data.metrics.occupancyRate || 0),
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ];
        break;
      case 'STATION':
        datasets = [
          {
            label: 'Passenger Count',
            data: data.map(item => item.data.metrics.passengerCount || 0),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }
        ];
        break;
      case 'PAYMENT':
        datasets = [
          {
            label: 'Total Payments',
            data: data.map(item => item.data.metrics.paymentStats?.total || 0),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Successful Payments',
            data: data.map(item => item.data.metrics.paymentStats?.successful || 0),
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1
          },
          {
            label: 'Failed Payments',
            data: data.map(item => item.data.metrics.paymentStats?.failed || 0),
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ];
        break;
      case 'FEEDBACK':
        datasets = [
          {
            label: 'Positive',
            data: data.map(item => item.data.metrics.feedbackCount?.positive || 0),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Negative',
            data: data.map(item => item.data.metrics.feedbackCount?.negative || 0),
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          },
          {
            label: 'Neutral',
            data: data.map(item => item.data.metrics.feedbackCount?.neutral || 0),
            borderColor: 'rgb(255, 205, 86)',
            tension: 0.1
          }
        ];
        break;
    }

    return {
      labels,
      datasets
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${analyticsType} Analytics`
      }
    }
  };

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <select
            value={analyticsType}
            onChange={(e) => setAnalyticsType(e.target.value as any)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="ROUTE">Route Analytics</option>
            <option value="BUS">Bus Analytics</option>
            <option value="STATION">Station Analytics</option>
            <option value="PAYMENT">Payment Analytics</option>
            <option value="FEEDBACK">Feedback Analytics</option>
          </select>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <Line data={getChartData()} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;