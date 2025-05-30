export type AnalyticsType = 'ROUTE' | 'BUS' | 'STATION' | 'PAYMENT' | 'FEEDBACK';
export type AnalyticsPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface AnalyticsData {
  type: AnalyticsType;
  period: AnalyticsPeriod;
  data: {
    timestamp: string;
    metrics: {
      passengerCount?: number;
      revenue?: number;
      averageSpeed?: number;
      delayTime?: number;
      occupancyRate?: number;
      paymentStats?: {
        total: number;
        successful: number;
        failed: number;
        averageAmount: number;
      };
      feedbackCount?: {
        positive: number;
        negative: number;
        neutral: number;
      };
    };
    routeId?: string;
    busId?: string;
    stationId?: string;
  };
}

export interface DashboardStats {
  totalPassengers: number;
  activeBuses: number;
  totalStations: number;
  alerts: number;
  ridershipTrend: {
    labels: string[];
    data: number[];
  };
  recentAlerts: {
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }[];
  busStatus: {
    id: string;
    route: string;
    status: 'active' | 'maintenance' | 'offline';
    passengers: number;
    location: string;
  }[];
} 