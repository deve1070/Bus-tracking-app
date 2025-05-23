import express, { RequestHandler } from 'express';
import { receiveGPSData, getLastKnownLocation } from '../controllers/gpsController';

const router = express.Router();

// Route for GPS trackers to send data
router.post('/update', receiveGPSData as RequestHandler);

// Route to get last known location
router.get('/location/:deviceId', getLastKnownLocation as RequestHandler);

export default router; 