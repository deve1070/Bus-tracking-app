import express, { Request, Response, RequestHandler } from 'express';
import { Bus } from '../models';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Route for registering a simulated bus
const registerBus = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { busNumber, routeNumber, deviceId, status, route, schedule } = authReq.body;

    // Create new bus
    const bus = new Bus({
      busNumber,
      routeNumber,
      capacity: 50,
      deviceId,
      status: status || 'ACTIVE',
      route: route || {
        stations: [],
        estimatedTime: 30
      },
      schedule: schedule || {
        departureTime: new Date().toISOString(),
        arrivalTime: new Date(Date.now() + 3600000).toISOString()
      },
      currentLocation: {
        type: 'Point',
        coordinates: [0, 0] // Default location
      },
      trackingData: {
        speed: 0,
        heading: 0,
        lastUpdate: new Date()
      }
    });

    await bus.save();
    res.status(201).json(bus);
  } catch (error) {
    console.error('Error registering simulated bus:', error);
    res.status(500).json({ error: 'Failed to register bus' });
  }
};

// Route for updating simulated bus location
const updateBusLocation = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { deviceId, location, speed, heading, status } = authReq.body;

    const bus = await Bus.findOneAndUpdate(
      { deviceId },
      {
        currentLocation: {
          type: 'Point',
          coordinates: [location.lng, location.lat]
        },
        trackingData: {
          speed,
          heading,
          lastUpdate: new Date()
        },
        status,
        lastUpdateTime: new Date()
      },
      { new: true }
    );

    if (!bus) {
      res.status(404).json({ error: 'Bus not found' });
      return;
    }

    res.json(bus);
  } catch (error) {
    console.error('Error updating bus location:', error);
    res.status(500).json({ error: 'Failed to update bus location' });
  }
};

// Route for verifying simulation code
const verifyCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const validCode = process.env.SIMULATION_CODE || '123456'; // Default code for testing

    if (code === validCode) {
      res.json({ success: true, message: 'Code verified successfully' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid simulation code' });
    }
  } catch (error) {
    console.error('Error verifying simulation code:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
};

router.post('/register', authenticateToken, registerBus);
router.post('/update-location', authenticateToken, updateBusLocation);
router.post('/verify-code', verifyCode);

export default router; 