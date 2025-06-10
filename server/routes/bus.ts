import express, { RequestHandler } from 'express';
import {
  createBus,
  updateBus,
  deleteBus,
  getBuses,
  getBusById,
  updateBusLocation,
  assignDriver,
  calculateRoute,
  getBusTrackingInfo,
  getBusLocations,
  getStationBuses
} from '../controllers/busController';
import { authenticateToken, checkRole } from '../middleware/auth';
import { UserRole, Bus } from '../models';

const router = express.Router();

// Public routes (no authentication required)
router.get('/locations', getBusLocations as RequestHandler);
router.get('/route/:startStationId/:endStationId', calculateRoute as RequestHandler);

// Protected routes (require authentication)
router.use(authenticateToken);

// Specific routes first
router.get('/station', getStationBuses as RequestHandler);
router.get('/list', (async (req, res) => {
  try {
    const buses = await Bus.find({}, {
      busNumber: 1,
      routeNumber: 1,
      deviceId: 1,
      status: 1
    }).sort({ busNumber: 1 });

    res.json(buses);
  } catch (error) {
    console.error('Error fetching buses:', error);
    res.status(500).json({ error: 'Failed to fetch buses' });
  }
}) as RequestHandler);

// Bus-specific routes
router.get('/:id/tracking', getBusTrackingInfo as RequestHandler);
router.post('/:id/location', checkRole([UserRole.DRIVER]), updateBusLocation as RequestHandler);
router.post('/:id/assign-driver', checkRole([UserRole.MAIN_ADMIN]), assignDriver as RequestHandler);

// Generic routes last
router.post('/', checkRole([UserRole.MAIN_ADMIN]), createBus as RequestHandler);
router.put('/:id', checkRole([UserRole.MAIN_ADMIN, UserRole.STATION_ADMIN]), updateBus as RequestHandler);
router.delete('/:id', checkRole([UserRole.MAIN_ADMIN]), deleteBus as RequestHandler);
router.get('/', getBuses as RequestHandler);
router.get('/:id', getBusById as RequestHandler);

// Register a new bus
router.post('/register', (async (req, res) => {
  try {
    const { busNumber, routeNumber, deviceId } = req.body;

    // Validate required fields
    if (!busNumber || !routeNumber || !deviceId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if bus already exists
    const existingBus = await Bus.findOne({ deviceId });
    if (existingBus) {
      return res.status(400).json({ error: 'Bus with this device ID already exists' });
    }

    // Create new bus
    const bus = new Bus({
      busNumber,
      routeNumber,
      deviceId,
      status: 'INACTIVE',
      currentLocation: {
        type: 'Point',
        coordinates: [0, 0] // Default coordinates
      },
      trackingData: {
        speed: 0,
        heading: 0,
        lastUpdate: new Date()
      }
    });

    await bus.save();

    res.status(201).json({ success: true, bus });
  } catch (error) {
    console.error('Error registering bus:', error);
    res.status(500).json({ error: 'Failed to register bus' });
  }
}) as RequestHandler);

export default router; 