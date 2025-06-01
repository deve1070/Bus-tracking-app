import express, { Request, Response, RequestHandler } from 'express';
import { Bus } from '../models';

const router = express.Router();

// Route for registering a simulated bus
router.post('/register', (async (req: Request, res: Response) => {
  try {
    const { busNumber, routeNumber, deviceId, status, route, schedule } = req.body;

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
}) as RequestHandler);

// Route for updating simulated bus location
router.post('/update-location', (async (req: Request, res: Response) => {
  try {
    const { deviceId, location, speed, heading, status } = req.body;

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
      return res.status(404).json({ error: 'Bus not found' });
    }

    res.json(bus);
  } catch (error) {
    console.error('Error updating bus location:', error);
    res.status(500).json({ error: 'Failed to update bus location' });
  }
}) as RequestHandler);

export default router; 