import express, { RequestHandler } from 'express';
import {
  notifyDriver,
  notifyAllDrivers,
  notifyRoutePassengers,
  notifyStationPassengers,
  subscribeToTopic,
  unsubscribeFromTopic
} from '../controllers/notificationController';
import { auth, checkRole } from '../middleware/auth';
import { UserRole } from '../models';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Admin routes
router.post('/driver', checkRole([UserRole.MAIN_ADMIN, UserRole.STATION_ADMIN]), notifyDriver as RequestHandler);
router.post('/drivers', checkRole([UserRole.MAIN_ADMIN]), notifyAllDrivers as RequestHandler);
router.post('/route', checkRole([UserRole.MAIN_ADMIN, UserRole.STATION_ADMIN]), notifyRoutePassengers as RequestHandler);
router.post('/station', checkRole([UserRole.MAIN_ADMIN, UserRole.STATION_ADMIN]), notifyStationPassengers as RequestHandler);

// Public routes (for device token management)
router.post('/subscribe', subscribeToTopic as RequestHandler);
router.post('/unsubscribe', unsubscribeFromTopic as RequestHandler);

export default router; 