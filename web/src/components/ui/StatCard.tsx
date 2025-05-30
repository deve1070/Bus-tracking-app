import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  isNeutral?: boolean;
  icon: React.ReactElement<LucideIcon>;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  isPositive, 
  isNeutral, 
  icon,
  loading = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          {icon}
        </div>
      </div>
      {change && !loading && (
        <div className="mt-4 flex items-center">
          {isPositive !== undefined && (
            <span className={`text-sm font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {change}
            </span>
          )}
          {isNeutral && (
            <span className="text-sm font-medium text-gray-600">
              {change}
            </span>
          )}
      </div>
      )}
    </div>
  );
};

export default StatCard;