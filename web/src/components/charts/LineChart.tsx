import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  data: number[];
  labels: string[];
  loading?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({ data, labels, loading = false }) => {
  if (loading) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
    );
  }

  const chartData = {
    labels,
            datasets: [
              {
        label: 'Passengers',
        data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.4,
      },
    ],
  };

  const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
        display: false,
              },
      title: {
        display: false,
              },
            },
            scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
              x: {
                grid: {
                  display: false,
        },
                },
    },
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;