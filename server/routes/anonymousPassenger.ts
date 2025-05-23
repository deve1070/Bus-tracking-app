import express, { RequestHandler } from 'express';
import {
  getRouteBuses,
  getNearbyStations,
  processPayment,
  getPaymentHistory
} from '../controllers/anonymousPassengerController';

const router = express.Router();

// Public routes (no authentication required)
router.get('/route-buses', getRouteBuses as RequestHandler);
router.get('/nearby-stations', getNearbyStations as RequestHandler);
router.post('/payment', processPayment as RequestHandler);
router.get('/payment-history/:deviceId', getPaymentHistory as RequestHandler);

export default router; 