import express, { RequestHandler } from 'express';
import { Bus } from '../models';
import { io } from '../app';

const router = express.Router();

// Endpoint to receive GPS data from mobile devices
router.post('/update', (async (req, res) => {
  try {
    const {
      deviceId,
      busNumber,
      routeNumber,
      location,
      speed,
      heading,
      status = 'active'
    } = req.body;

    // Validate required fields
    if (!deviceId || !busNumber || !routeNumber || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find bus by device ID
    const bus = await Bus.findOne({ deviceId });
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found for this device' });
    }

    // Update bus location
    const updatedBus = await Bus.findByIdAndUpdate(
      bus._id,
      {
        currentLocation: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        },
        trackingData: {
          speed: speed || 0,
          heading: heading || 0,
          lastUpdate: new Date()
        },
        status: status.toUpperCase(),
        lastUpdateTime: new Date()
      },
      { new: true }
    );

    if (!updatedBus) {
      return res.status(404).json({ error: 'Failed to update bus location' });
    }

    // Emit the update to all connected clients
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

    res.json({ success: true, bus: updatedBus });
  } catch (error) {
    console.error('Error updating GPS location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
}) as RequestHandler);

// Get all bus locations
router.get('/locations', (async (req, res) => {
  try {
    const buses = await Bus.find({}, {
      deviceId: 1,
      busNumber: 1,
      routeNumber: 1,
      currentLocation: 1,
      trackingData: 1,
      status: 1,
      lastUpdateTime: 1
    });

    const locations = buses.map(bus => ({
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

    res.json(locations);
  } catch (error) {
    console.error('Error fetching bus locations:', error);
    res.status(500).json({ error: 'Failed to fetch bus locations' });
  }
}) as RequestHandler);

export default router; 