import { Bus, Station } from '../models';
import { io } from '../app';
import { OSRMService } from './osrmService';

interface GPSData {
  deviceId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: Date;
}

export class GPSService {
  /**
   * Validate GPS coordinates
   */
  static validateCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180
    );
  }

  /**
   * Process GPS data from tracker
   */
  static async processGPSData(data: GPSData): Promise<void> {
    try {
      // Validate coordinates
      if (!this.validateCoordinates(data.latitude, data.longitude)) {
        throw new Error('Invalid GPS coordinates');
      }

      // Find bus by device ID
      const bus = await Bus.findOne({ deviceId: data.deviceId });
      if (!bus) {
        throw new Error('Bus not found for device ID');
      }

      // Update bus location and status
      bus.currentLocation = {
        type: 'Point',
        coordinates: [data.longitude, data.latitude]
      };
      bus.lastUpdateTime = data.timestamp;
      bus.status = data.speed > 0 ? 'ACTIVE' : 'INACTIVE';

      // Update tracking data
      bus.trackingData = {
        speed: data.speed,
        heading: data.heading,
        lastUpdate: data.timestamp
      };

      await bus.save();
    } catch (error) {
      console.error('Error processing GPS data:', error);
      throw error;
    }
  }

  /**
   * Get last known location of a bus
   */
  static async getLastKnownLocation(deviceId: string) {
    try {
      const bus = await Bus.findOne({ deviceId });
      if (!bus) {
        throw new Error('Bus not found');
      }

      return {
        deviceId,
        latitude: bus.currentLocation.coordinates[1],
        longitude: bus.currentLocation.coordinates[0],
        speed: bus.trackingData?.speed || 0,
        heading: bus.trackingData?.heading || 0,
        lastUpdate: bus.lastUpdateTime
      };
    } catch (error) {
      console.error('Error getting last known location:', error);
      throw error;
    }
  }

  static async updateBusLocation(busId: string, data: {
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
  }) {
    try {
      const bus = await Bus.findById(busId);
      if (!bus) {
        throw new Error('Bus not found');
      }

      // Update bus location and status
      bus.currentLocation = {
        type: 'Point',
        coordinates: [data.longitude, data.latitude]
      };
      bus.status = data.speed > 0 ? 'ACTIVE' : 'INACTIVE';
      bus.lastUpdateTime = new Date();

      // Update tracking data
      bus.trackingData = {
        speed: data.speed,
        heading: data.heading,
        lastUpdate: new Date()
      };

      await bus.save();

      // Emit location update through socket.io
      io.emit('gps-update', {
        deviceId: bus.deviceId,
        busNumber: bus.busNumber,
        routeNumber: bus.routeNumber,
        location: {
          lat: bus.currentLocation.coordinates[1],
          lng: bus.currentLocation.coordinates[0]
        },
        speed: bus.trackingData?.speed || 0,
        heading: bus.trackingData?.heading || 0,
        status: bus.status,
        lastUpdate: bus.lastUpdateTime,
        currentStation: bus.currentStationId,
        nextStation: bus.route?.stations[0] || null,
        eta: bus.route?.estimatedTime || null,
        distanceToNext: null // Will be calculated when needed
      });

      // If bus is near any stations, emit arrival notification
      if (bus.route?.stations && bus.route.stations.length > 0) {
        const nextStation = await this.findNextStation(bus);
        if (nextStation) {
          const distance = await OSRMService.calculateDistance(
            { lat: data.latitude, lng: data.longitude },
            { lat: nextStation.location.coordinates[1], lng: nextStation.location.coordinates[0] }
          );

          if (distance <= 500) { // 500 meters threshold
            io.emit('station-arrival', {
              busId: bus._id,
              busNumber: bus.busNumber,
              stationId: nextStation._id,
              stationName: nextStation.name,
              estimatedArrival: new Date(Date.now() + (distance / data.speed) * 1000)
            });
          }
        }
      }

      return bus;
    } catch (error) {
      console.error('Error updating bus location:', error);
      throw error;
    }
  }

  private static async findNextStation(bus: any) {
    if (!bus.route?.stations || bus.route.stations.length === 0) {
      return null;
    }

    const currentLocation = bus.currentLocation.coordinates;
    let nearestStation = null;
    let minDistance = Infinity;

    for (const stationId of bus.route.stations) {
      const station = await Station.findById(stationId);
      if (station) {
        const distance = await OSRMService.calculateDistance(
          { lat: currentLocation[1], lng: currentLocation[0] },
          { lat: station.location.coordinates[1], lng: station.location.coordinates[0] }
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestStation = station;
        }
      }
    }

    return nearestStation;
  }
} 