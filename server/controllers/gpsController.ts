import { Request, Response } from 'express';
import { GPSService } from '../services/gpsService';
import { io } from '../server';

export const receiveGPSData = async (req: Request, res: Response) => {
  try {
    const {
      deviceId,
      latitude,
      longitude,
      speed,
      heading,
      timestamp
    } = req.body;

    // Process GPS data
    await GPSService.processGPSData({
      deviceId,
      latitude,
      longitude,
      speed,
      heading,
      timestamp: new Date(timestamp)
    });

    // Emit real-time update
    io.to(deviceId).emit('gps-update', {
      deviceId,
      location: {
        lat: latitude,
        lng: longitude
      },
      speed,
      heading,
      timestamp: new Date(timestamp)
    });

    res.status(200).json({ message: 'GPS data received successfully' });
  } catch (error) {
    console.error('Error receiving GPS data:', error);
    res.status(400).json({ error: 'Failed to process GPS data' });
  }
};

export const getLastKnownLocation = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const location = await GPSService.getLastKnownLocation(deviceId);
    res.json(location);
  } catch (error) {
    console.error('Error getting last known location:', error);
    res.status(400).json({ error: 'Failed to get last known location' });
  }
}; 