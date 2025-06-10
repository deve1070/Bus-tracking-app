// API Configuration
const DEV_API_URL = 'http://192.168.16.237:3000'; // Your current network IP
const LOCAL_API_URL = 'http://localhost:3000';
const PROD_API_URL = 'https://your-production-api.com';

// Network Configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || DEV_API_URL;
export const API_TIMEOUT = 30000; // 30 seconds
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 second

// Socket Configuration
export const SOCKET_URL = DEV_API_URL;
export const SOCKET_TIMEOUT = 5000; // 5 seconds
export const SOCKET_RECONNECT_ATTEMPTS = 5;
export const SOCKET_RECONNECT_DELAY = 1000; // 1 second 