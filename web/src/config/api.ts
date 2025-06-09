export const API_BASE_URL = 'http://localhost:5000/api';
export const WS_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
  },
  BUS: {
    LIST: `${API_BASE_URL}/bus`,
    DETAILS: (id: string) => `${API_BASE_URL}/bus/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/bus/${id}`,
    CREATE: `${API_BASE_URL}/bus`,
    DELETE: (id: string) => `${API_BASE_URL}/bus/${id}`,
  },
  STATION: {
    LIST: `${API_BASE_URL}/stations`,
    DETAILS: (id: string) => `${API_BASE_URL}/stations/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/stations/${id}`,
    CREATE: `${API_BASE_URL}/stations`,
    DELETE: (id: string) => `${API_BASE_URL}/stations/${id}`,
  },
  ROUTE: {
    LIST: `${API_BASE_URL}/routes`,
    DETAILS: (id: string) => `${API_BASE_URL}/routes/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/routes/${id}`,
    CREATE: `${API_BASE_URL}/routes`,
    DELETE: (id: string) => `${API_BASE_URL}/routes/${id}`,
  }
}; 