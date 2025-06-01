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
  getBusLocations
} from '../controllers/busController';
import { auth, checkRole } from '../middleware/auth';
import { UserRole, Bus } from '../models';

const router = express.Router();

// Public routes (no authentication required)
router.get('/locations', getBusLocations as RequestHandler);
router.get('/route/:startStationId/:endStationId', calculateRoute as RequestHandler);
router.get('/:id/tracking', getBusTrackingInfo as RequestHandler);

// Protected routes (require authentication)
router.use(auth);

// Routes accessible by main admin and station admin
router.post('/', checkRole([UserRole.MAIN_ADMIN]), createBus as RequestHandler);
router.put('/:id', checkRole([UserRole.MAIN_ADMIN]), updateBus as RequestHandler);
router.delete('/:id', checkRole([UserRole.MAIN_ADMIN]), deleteBus as RequestHandler);
router.get('/', getBuses as RequestHandler);
router.get('/:id', getBusById as RequestHandler);

// Routes for bus location updates (accessible by drivers)
router.post('/:id/location', checkRole([UserRole.DRIVER]), updateBusLocation as RequestHandler);

// Route for assigning drivers (main admin only)
router.post('/:id/assign-driver', checkRole([UserRole.MAIN_ADMIN]), assignDriver as RequestHandler);

// List all registered buses
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