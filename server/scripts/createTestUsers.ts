import mongoose from 'mongoose';
import { User, UserRole, Station, Bus } from '../models';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

function getRandomString(length = 6) {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

dotenv.config();

const createTestUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bus-tracking');
    console.log('Connected to MongoDB');

    // Create a test station
    const station = new Station({
      name: 'Test Station',
      location: {
        type: 'Point',
        coordinates: [38.7467, 9.0107] // Addis Ababa coordinates
      },
      address: 'Test Address',
      phoneNumber: '1234567890'
    });
    await station.save();
    console.log('Test station created successfully');

    // Create a test bus with unique busNumber and deviceId
    const busNumber = `BUS-${getRandomString(4)}`;
    const deviceId = `DEV-${getRandomString(4)}`;
    const bus = new Bus({
      busNumber,
      routeNumber: 'R-001',
      capacity: 40,
      deviceId,
      currentLocation: {
        type: 'Point',
        coordinates: [38.7467, 9.0107]
      },
      status: 'ACTIVE',
      route: {
        stations: [station._id],
        estimatedTime: 60
      },
      schedule: {
        departureTime: '08:00',
        arrivalTime: '10:00'
      },
      lastUpdateTime: new Date(),
      isOnRoute: false,
      currentPassengerCount: 0
    });
    await bus.save();
    console.log('Test bus created successfully:', busNumber, deviceId);

    // Create a station admin
    const stationAdminPassword = await bcrypt.hash('admin123', 10);
    const stationAdmin = new User({
      email: 'station.admin@example.com',
      password: stationAdminPassword,
      firstName: 'Station',
      lastName: 'Admin',
      role: UserRole.STATION_ADMIN,
      phoneNumber: '1234567890',
      username: 'stationadmin',
      stationId: station._id
    });

    // Create a driver
    const driverPassword = await bcrypt.hash('driver123', 10);
    const driver = new User({
      email: 'driver@example.com',
      password: driverPassword,
      firstName: 'John',
      lastName: 'Driver',
      role: UserRole.DRIVER,
      phoneNumber: '0987654321',
      username: 'driver1',
      stationId: station._id,
      busId: bus._id
    });

    // Save users
    await Promise.all([stationAdmin.save(), driver.save()]);
    console.log('Test users created successfully');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers(); 