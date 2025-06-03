// Get the API URL from environment variables or use a default value
const DEV_API_URL = 'http://192.168.27.10:3000'; // Local development server
const PROD_API_URL = 'https://your-production-api.com'; // Replace with your production API URL

export const API_URL = process.env.EXPO_PUBLIC_API_URL || DEV_API_URL;

// Add timeout configuration
export const API_TIMEOUT = 10000; // 10 seconds

// Add retry configuration
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 second 