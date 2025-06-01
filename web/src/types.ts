export enum UserRole {
  MAIN_ADMIN = 'MAIN_ADMIN',
  STATION_ADMIN = 'STATION_ADMIN',
  DRIVER = 'DRIVER',
  PASSENGER = 'PASSENGER'
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  stationId?: string;
}

export interface Feedback {
  _id: string;
  type: 'COMPLAINT' | 'SUGGESTION' | 'PRAISE';
  category: string;
  message: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  response?: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
} 