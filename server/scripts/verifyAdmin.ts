import mongoose from 'mongoose';
import { User, UserRole } from '../models';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bus-tracking';

async function verifyAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const adminEmail = 'admin@bustracking.com';
    const admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.log('Admin user not found, creating...');
      
      // Create admin user
      const adminUser = new User({
        email: adminEmail,
        password: 'Admin@123',
        firstName: 'System',
        lastName: 'Admin',
        role: UserRole.MAIN_ADMIN,
        phoneNumber: '1234567890',
        username: 'system_admin'
      });

      await adminUser.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Verify admin user
    const verifiedAdmin = await User.findOne({ email: adminEmail }).select('+password');
    console.log('Admin user details:', {
      id: verifiedAdmin?._id,
      email: verifiedAdmin?.email,
      role: verifiedAdmin?.role,
      hasPassword: !!verifiedAdmin?.password
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

verifyAdmin(); 