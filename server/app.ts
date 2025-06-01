import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import busRoutes from './routes/bus';
import stationRoutes from './routes/station';
import feedbackRoutes from './routes/feedback';
import routeRoutes from './routes/route';
import analyticsRoutes from './routes/analytics';
import userRoutes from './routes/userRoutes';
import notificationRoutes from './routes/notification';
import paymentRoutes from './routes/payment';
import settingsRoutes from './routes/settings';
import gpsRoutes from './routes/gps';
import simulatorRoutes from './routes/simulator';
import { Bus } from './models';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configure CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://192.168.27.10:3000',
  'exp://192.168.27.10:19000',
  'exp://192.168.27.10:19001',
  'exp://192.168.27.10:19002'
];

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 10000,
  allowEIO3: true,
  path: '/socket.io/'
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle GPS updates from phones
  socket.on('gps-update', async (data) => {
    try {
      // Find bus by device ID
      const bus = await Bus.findOne({ deviceId: data.deviceId });
      if (!bus) {
        console.error('Bus not found for device:', data.deviceId);
        return;
      }

      // Update bus location
      const updatedBus = await Bus.findByIdAndUpdate(
        bus._id,
        {
          currentLocation: {
            type: 'Point',
            coordinates: [data.location.longitude, data.location.latitude]
          },
          trackingData: {
            speed: data.speed,
            heading: data.heading,
            lastUpdate: new Date()
          },
          status: data.status,
          lastUpdateTime: new Date()
        },
        { new: true }
      );

      if (updatedBus) {
        // Broadcast the update to all connected clients
        io.emit('busLocationUpdate', [{
          deviceId: updatedBus.deviceId,
          busNumber: updatedBus.busNumber,
          routeNumber: updatedBus.routeNumber,
          location: {
            lat: updatedBus.currentLocation.coordinates[1],
            lng: updatedBus.currentLocation.coordinates[0]
          },
          speed: updatedBus.trackingData?.speed || 0,
          heading: updatedBus.trackingData?.heading || 0,
          status: updatedBus.status,
          lastUpdate: updatedBus.lastUpdateTime
        }]);
      }
    } catch (error) {
      console.error('Error handling GPS update:', error);
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  // Emit bus locations to all connected clients
  const emitBusLocations = async () => {
    try {
      const buses = await Bus.find({}, {
        deviceId: 1,
        busNumber: 1,
        routeNumber: 1,
        currentLocation: 1,
        trackingData: 1,
        status: 1,
        lastUpdateTime: 1
      }).lean();

      const busLocations = buses.map(bus => ({
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
        lastUpdate: bus.lastUpdateTime
      }));

      io.emit('busLocationUpdate', busLocations);
    } catch (error) {
      console.error('Error emitting bus locations:', error);
    }
  };

  // Emit bus locations every 5 seconds
  const locationInterval = setInterval(emitBusLocations, 5000);

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
    clearInterval(locationInterval);
  });
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    // Create a copy of the body without sensitive data
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) delete sanitizedBody.password;
    if (sanitizedBody.newPassword) delete sanitizedBody.newPassword;
    console.log('Request body:', sanitizedBody);
  }
  next();
});

// Connect to MongoDB with timeout
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bus-tracking', {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit if cannot connect to database
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/bus', busRoutes);
app.use('/api/gps', gpsRoutes);
app.use('/api/simulator', simulatorRoutes);

// Add root route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Bus Tracking API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      buses: '/api/buses',
      stations: '/api/stations',
      routes: '/api/routes',
      feedback: '/api/feedback',
      analytics: '/api/analytics',
      users: '/api/users',
      notifications: '/api/notifications',
      payments: '/api/payments',
      settings: '/api/settings'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Add timeout to all requests
app.use((req, res, next) => {
  res.setTimeout(5000, () => {
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

export { app, io, httpServer };
