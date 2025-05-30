import mongoose from 'mongoose';
import { Station } from '../models/Station';
import dotenv from 'dotenv';

dotenv.config();

const seedStations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bus-tracking');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Station.deleteMany({});
    console.log('Cleared existing stations');

    // Create sample stations
    const stations = await Station.create([
      {
        name: 'Central Station',
        location: {
          type: 'Point',
          coordinates: [38.7465, 9.0222]
        },
        address: '123 Main Street',
        facilities: ['ticket_office', 'waiting_room', 'restroom', 'parking'],
        status: 'active'
      },
      {
        name: 'City Hall',
        location: {
          type: 'Point',
          coordinates: [38.7475, 9.0232]
        },
        address: '456 Government Avenue',
        facilities: ['ticket_office', 'waiting_room', 'restroom'],
        status: 'active'
      },
      {
        name: 'University Campus',
        location: {
          type: 'Point',
          coordinates: [38.7485, 9.0242]
        },
        address: '789 Education Road',
        facilities: ['ticket_office', 'waiting_room', 'restroom', 'parking', 'bike_rack'],
        status: 'active'
      },
      {
        name: 'Shopping Mall',
        location: {
          type: 'Point',
          coordinates: [38.7495, 9.0252]
        },
        address: '321 Retail Boulevard',
        facilities: ['ticket_office', 'waiting_room', 'restroom', 'parking', 'shopping_center'],
        status: 'active'
      },
      {
        name: 'Sports Complex',
        location: {
          type: 'Point',
          coordinates: [38.7505, 9.0262]
        },
        address: '654 Stadium Drive',
        facilities: ['ticket_office', 'waiting_room', 'restroom', 'parking', 'sports_facilities'],
        status: 'active'
      }
    ]);
    console.log('Added sample stations');

    console.log('Data seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedStations(); 