import mongoose from 'mongoose';
import { Bus } from '../models/Bus';
import { Route } from '../models/Route';
import { Station } from '../models/Station';
import dotenv from 'dotenv';

dotenv.config();

const seedBusesAndRoutes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bus-tracking');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Bus.deleteMany({});
    await Route.deleteMany({});
    console.log('Cleared existing buses and routes');

    // Get existing stations
    const stations = await Station.find();
    if (stations.length === 0) {
      console.log('No stations found. Please add stations first.');
      return;
    }

    // Create sample routes
    const routes = await Route.create([
      {
        routeNumber: 'R001',
        name: 'Downtown Express',
        description: 'Express service between Central Station and City Hall',
        stations: [stations[0]._id, stations[1]._id],
        totalDistance: 5.2,
        estimatedDuration: 15,
        schedule: {
          weekdays: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
          weekends: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']
        },
        fare: 2.50
      },
      {
        routeNumber: 'R002',
        name: 'City Loop',
        description: 'Circular route connecting all major stations',
        stations: stations.map(s => s._id),
        totalDistance: 12.5,
        estimatedDuration: 45,
        schedule: {
          weekdays: ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
          weekends: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
        },
        fare: 3.00
      }
    ]);
    console.log('Added sample routes');

    // Create sample buses
    const buses = await Bus.create([
      {
        busNumber: 'BUS-001',
        routeNumber: 'R001',
        capacity: 50,
        deviceId: 'GPS-001',
        currentLocation: {
          type: 'Point',
          coordinates: [38.7465, 9.0222]
        },
        status: 'ACTIVE',
        route: {
          stations: [stations[0]._id, stations[1]._id],
          estimatedTime: 15
        },
        schedule: {
          departureTime: '08:00',
          arrivalTime: '08:15'
        },
        lastUpdateTime: new Date(),
        isOnRoute: true,
        currentPassengerCount: 25,
        trackingData: {
          speed: 30,
          heading: 90,
          lastUpdate: new Date()
        }
      },
      {
        busNumber: 'BUS-002',
        routeNumber: 'R002',
        capacity: 45,
        deviceId: 'GPS-002',
        currentLocation: {
          type: 'Point',
          coordinates: [-74.006, 40.7128]
        },
        status: 'ACTIVE',
        route: {
          stations: stations.map(s => s._id),
          estimatedTime: 45
        },
        schedule: {
          departureTime: '07:00',
          arrivalTime: '07:45'
        },
        lastUpdateTime: new Date(),
        isOnRoute: true,
        currentPassengerCount: 30,
        trackingData: {
          speed: 25,
          heading: 180,
          lastUpdate: new Date()
        }
      },
      {
        busNumber: 'BUS-003',
        routeNumber: 'R001',
        capacity: 55,
        deviceId: 'GPS-003',
        currentLocation: {
          type: 'Point',
          coordinates: [38.7465, 9.0222]
        },
        status: 'MAINTENANCE',
        route: {
          stations: [stations[0]._id, stations[1]._id],
          estimatedTime: 15
        },
        schedule: {
          departureTime: '09:00',
          arrivalTime: '09:15'
        },
        lastUpdateTime: new Date(),
        isOnRoute: false,
        currentPassengerCount: 0,
        trackingData: {
          speed: 0,
          heading: 0,
          lastUpdate: new Date()
        }
      }
    ]);
    console.log('Added sample buses');

    console.log('Data seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedBusesAndRoutes(); 