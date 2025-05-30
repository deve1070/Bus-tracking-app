import mongoose from 'mongoose';
import { Analytics } from '../models/Analytics';
import { Bus } from '../models/Bus';
import { Route } from '../models/Route';
import { Station } from '../models/Station';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bus-tracking');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Analytics.deleteMany({});
    console.log('Cleared existing analytics data');

    // Get existing stations
    const stations = await Station.find();
    if (stations.length === 0) {
      console.log('No stations found. Please add stations first.');
      return;
    }

    // Create sample buses
    const buses = await Bus.find();
    if (buses.length === 0) {
      console.log('No buses found. Please add buses first.');
      return;
    }

    // Create sample routes
    const routes = await Route.find();
    if (routes.length === 0) {
      console.log('No routes found. Please add routes first.');
      return;
    }

    // Generate analytics data for the last 7 days
    const today = new Date();
    const analyticsData = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Route analytics
      for (const route of routes) {
        analyticsData.push({
          type: 'ROUTE',
          data: {
            routeId: route._id,
            timestamp: date,
            metrics: {
              passengerCount: Math.floor(Math.random() * 100),
              revenue: Math.floor(Math.random() * 1000),
              averageSpeed: Math.floor(Math.random() * 60),
              delayTime: Math.floor(Math.random() * 30)
            }
          },
          period: 'DAILY'
        });
      }

      // Bus analytics
      for (const bus of buses) {
        analyticsData.push({
          type: 'BUS',
          data: {
            busId: bus._id,
            timestamp: date,
            metrics: {
              passengerCount: Math.floor(Math.random() * 50),
              occupancyRate: Math.floor(Math.random() * 100),
              averageSpeed: Math.floor(Math.random() * 60),
              delayTime: Math.floor(Math.random() * 30)
            }
          },
          period: 'DAILY'
        });
      }

      // Station analytics
      for (const station of stations) {
        analyticsData.push({
          type: 'STATION',
          data: {
            stationId: station._id,
            timestamp: date,
            metrics: {
              passengerCount: Math.floor(Math.random() * 200)
            }
          },
          period: 'DAILY'
        });
      }

      // Payment analytics
      analyticsData.push({
        type: 'PAYMENT',
        data: {
          timestamp: date,
          metrics: {
            paymentStats: {
              total: Math.floor(Math.random() * 100),
              successful: Math.floor(Math.random() * 90),
              failed: Math.floor(Math.random() * 10),
              averageAmount: Math.floor(Math.random() * 50) + 10
            }
          }
        },
        period: 'DAILY'
      });

      // Feedback analytics
      analyticsData.push({
        type: 'FEEDBACK',
        data: {
          timestamp: date,
          metrics: {
            feedbackCount: {
              positive: Math.floor(Math.random() * 20),
              negative: Math.floor(Math.random() * 5),
              neutral: Math.floor(Math.random() * 10)
            }
          }
        },
        period: 'DAILY'
      });
    }

    // Insert analytics data
    await Analytics.insertMany(analyticsData);
    console.log('Added sample analytics data');

    console.log('Data seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedData(); 