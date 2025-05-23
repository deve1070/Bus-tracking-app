import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const LineChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart instance if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
              {
                label: 'This Week',
                data: [3200, 2800, 3400, 3600, 3200, 3800, 4000],
                borderColor: '#1E40AF',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#1E40AF',
                pointRadius: 3,
                pointHoverRadius: 5,
              },
              {
                label: 'Last Week',
                data: [2900, 2600, 3100, 3300, 3000, 3500, 3700],
                borderColor: '#94A3B8',
                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#94A3B8',
                pointRadius: 3,
                pointHoverRadius: 5,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                align: 'end',
              },
              tooltip: {
                mode: 'index',
                intersect: false,
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                }
              },
              y: {
                beginAtZero: true,
                grid: {
                  borderDash: [2, 4],
                  drawBorder: false,
                },
                ticks: {
                  callback: function(value) {
                    return value.toLocaleString();
                  }
                }
              }
            },
            interaction: {
              mode: 'nearest',
              axis: 'x',
              intersect: false
            }
          }
        });
      }
    }

    // Cleanup chart instance on component unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="h-80">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default LineChart;