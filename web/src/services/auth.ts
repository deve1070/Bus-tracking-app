import api from './api';

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
  role: UserRole;
  username: string;
  phoneNumber: string;
  stationId?: string; // Optional because not all users (like main admin) have a station
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log('Making login request to:', '/auth/login');
      console.log('Request payload:', { ...credentials, password: '***' });
      
      const response = await api.post<AuthResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('Login response received:', response.data);
    return response.data;
    } catch (error: any) {
      console.error('Login request failed:', error.response?.data || error.message);
      throw error;
    }
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
    } catch (error: any) {
      console.error('Registration request failed:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
    await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    }
  },

  getProfile: async (): Promise<User> => {
    try {
    const response = await api.get<User>('/auth/profile');
    return response.data;
    } catch (error: any) {
      console.error('Get profile request failed:', error.response?.data || error.message);
      throw error;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
    await api.post('/auth/change-password', { currentPassword, newPassword });
    } catch (error: any) {
      console.error('Change password request failed:', error.response?.data || error.message);
      throw error;
    }
  },

  refreshToken: async (): Promise<{ token: string }> => {
    try {
    const response = await api.post<{ token: string }>('/auth/refresh-token');
    return response.data;
    } catch (error: any) {
      console.error('Token refresh request failed:', error.response?.data || error.message);
      throw error;
    }
  },

  getCurrentUser: (): User | null => {
    try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  },

  setAuthData: (data: AuthResponse) => {
    try {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Error saving auth data to localStorage:', error);
    }
  }
}; 