import axios from 'axios';

const OSRM_BASE_URL = 'http://router.project-osrm.org/route/v1';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface Coordinate {
  lat: number;
  lng: number;
}

interface RouteResponse {
  routes: Array<{
    distance: number; // in meters
    duration: number; // in seconds
    geometry: string; // encoded polyline
    legs: Array<{
      distance: number;
      duration: number;
      steps: Array<{
        distance: number;
        duration: number;
        geometry: string;
      }>;
    }>;
  }>;
}

interface AxiosErrorResponse {
  status?: number;
  statusText?: string;
  data?: unknown;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryRequest<T>(requestFn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await requestFn();
  } catch (error: unknown) {
    if (retries > 0) {
      console.log(`Request failed, retrying... (${retries} attempts left)`);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: AxiosErrorResponse };
        console.log('Error details:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data
        });
      }
      await sleep(RETRY_DELAY);
      return retryRequest(requestFn, retries - 1);
    }
    throw error;
  }
}

export class OSRMService {
  /**
   * Calculate route between two points
   */
  static async calculateRoute(start: Coordinate, end: Coordinate): Promise<RouteResponse> {
    try {
      console.log('Calculating route:', { start, end });
      return await retryRequest(async () => {
        const response = await axios.get<RouteResponse>(
          `${OSRM_BASE_URL}/driving/${start.lng},${start.lat};${end.lng},${end.lat}`,
          {
            params: {
              overview: 'full',
              geometries: 'polyline',
              steps: true
            },
            timeout: 5000 // 5 second timeout
          }
        );
        return response.data;
      });
    } catch (error: unknown) {
      console.error('Error calculating route:', error instanceof Error ? error.message : error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: AxiosErrorResponse };
        console.error('Axios error details:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data
        });
      }
      throw new Error('Failed to calculate route');
    }
  }

  /**
   * Calculate distance between two points
   */
  static async calculateDistance(start: Coordinate, end: Coordinate): Promise<number> {
    try {
      console.log('Calculating distance:', { start, end });
      return await retryRequest(async () => {
        const response = await axios.get<RouteResponse>(
          `${OSRM_BASE_URL}/driving/${start.lng},${start.lat};${end.lng},${end.lat}`,
          {
            params: {
              overview: 'false'
            },
            timeout: 5000
          }
        );
        return response.data.routes[0].distance;
      });
    } catch (error: unknown) {
      console.error('Error calculating distance:', error instanceof Error ? error.message : error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: AxiosErrorResponse };
        console.error('Axios error details:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data
        });
      }
      throw new Error('Failed to calculate distance');
    }
  }

  /**
   * Calculate ETA between two points
   */
  static async calculateETA(start: Coordinate, end: Coordinate): Promise<number> {
    try {
      console.log('Calculating ETA:', { start, end });
      return await retryRequest(async () => {
        const response = await axios.get<RouteResponse>(
          `${OSRM_BASE_URL}/driving/${start.lng},${start.lat};${end.lng},${end.lat}`,
          {
            params: {
              overview: 'false'
            },
            timeout: 5000
          }
        );
        return response.data.routes[0].duration;
      });
    } catch (error: unknown) {
      console.error('Error calculating ETA:', error instanceof Error ? error.message : error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: AxiosErrorResponse };
        console.error('Axios error details:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data
        });
      }
      throw new Error('Failed to calculate ETA');
    }
  }

  /**
   * Calculate route with multiple waypoints
   */
  static async calculateRouteWithWaypoints(waypoints: Coordinate[]): Promise<RouteResponse> {
    try {
      console.log('Calculating route with waypoints:', waypoints);
      return await retryRequest(async () => {
        const coordinates = waypoints.map(point => `${point.lng},${point.lat}`).join(';');
        const response = await axios.get<RouteResponse>(
          `${OSRM_BASE_URL}/driving/${coordinates}`,
          {
            params: {
              overview: 'full',
              geometries: 'polyline',
              steps: true
            },
            timeout: 5000
          }
        );
        return response.data;
      });
    } catch (error: unknown) {
      console.error('Error calculating route with waypoints:', error instanceof Error ? error.message : error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: AxiosErrorResponse };
        console.error('Axios error details:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data
        });
      }
      throw new Error('Failed to calculate route with waypoints');
    }
  }
} 