import React, { useState } from 'react';
import RealTimeMapVisualization from './components/RealTimeMapVisualization';

const MonitoringPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Real-Time Bus Monitoring</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <RealTimeMapVisualization />
        </div>

        {/* Bus List Section */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Active Buses</h2>
          <div className="space-y-4">
            {/* Bus list will be implemented here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage; 