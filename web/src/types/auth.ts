export enum UserRole {
  MAIN_ADMIN = 'MainAdmin',
  STATION_ADMIN = 'StationAdmin',
  DRIVER = 'Driver'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  username: string;
  phoneNumber: string;
}

export interface LoginResponse {
  user: User;
  token: string;
} 