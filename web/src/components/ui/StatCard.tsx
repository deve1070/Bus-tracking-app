import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  isPositive?: boolean;
  isNeutral?: boolean;
  icon: React.ReactNode;
};

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  isPositive, 
  isNeutral, 
  icon 
}) => {
  let changeColor = 'text-gray-500';
  let changeIcon = null;

  if (isPositive) {
    changeColor = 'text-green-600';
    changeIcon = <ChevronUp size={16} />;
  } else if (isNeutral) {
    changeColor = 'text-gray-500';
  } else {
    changeColor = 'text-red-600';
    changeIcon = <ChevronDown size={16} />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className={`flex items-center mt-4 ${changeColor}`}>
        {changeIcon}
        <span className="text-sm font-medium">{change} from last week</span>
      </div>
    </div>
  );
};

export default StatCard;