import mongoose from 'mongoose';
import { Notification, User, UserRole } from '../models';
import dotenv from 'dotenv';

dotenv.config();

const createTestNotifications = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bus-tracking');
    console.log('Connected to MongoDB');

    // Find a station admin and a driver
    const stationAdmin = await User.findOne({ role: UserRole.STATION_ADMIN });
    const driver = await User.findOne({ role: UserRole.DRIVER });

    if (!stationAdmin || !driver) {
      console.error('Could not find required users for creating test notifications');
      process.exit(1);
    }

    // Create broadcast notifications
    const broadcastNotifications = [
      {
        title: 'System Maintenance',
        message: 'The system will be under maintenance from 2 AM to 4 AM tonight.',
        sender: stationAdmin._id,
        recipient: 'all',
        type: 'broadcast',
        read: false
      },
      {
        title: 'New Feature Announcement',
        message: 'We have added real-time bus tracking to our application!',
        sender: stationAdmin._id,
        recipient: 'all',
        type: 'broadcast',
        read: false
      }
    ];

    // Create driver-specific notifications
    const driverNotifications = [
      {
        title: 'Route Change',
        message: 'Your route has been updated. Please check the new schedule.',
        sender: stationAdmin._id,
        recipient: driver._id,
        type: 'driver',
        read: false
      },
      {
        title: 'Performance Review',
        message: 'Your monthly performance review is scheduled for next week.',
        sender: stationAdmin._id,
        recipient: driver._id,
        type: 'driver',
        read: false
      }
    ];

    // Insert notifications
    await Notification.insertMany([...broadcastNotifications, ...driverNotifications]);
    console.log('Test notifications created successfully');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating test notifications:', error);
    process.exit(1);
  }
};

createTestNotifications(); 