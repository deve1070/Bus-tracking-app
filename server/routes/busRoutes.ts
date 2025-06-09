import express, { RequestHandler } from 'express';
import { authenticateToken, checkRole } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  createBus,
  updateBus,
  deleteBus,
  getBuses,
  getBusById,
  updateBusLocation,
  getBusTrackingInfo,
  calculateRoute,
  assignDriver,
  getBusLocations,
  getStationBuses,
  updateBusStatus
} from '../controllers/busController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Public routes
router.get('/', getBuses as RequestHandler);
router.get('/:id', getBusById as RequestHandler);

// Station admin routes
router.get('/station', checkRole([UserRole.STATION_ADMIN]), getStationBuses as RequestHandler);
router.put('/:id/status', checkRole([UserRole.STATION_ADMIN]), updateBusStatus as RequestHandler);

// Main admin routes
router.post('/', checkRole([UserRole.MAIN_ADMIN]), createBus as RequestHandler);
router.put('/:id', checkRole([UserRole.MAIN_ADMIN]), updateBus as RequestHandler);
router.delete('/:id', checkRole([UserRole.MAIN_ADMIN]), deleteBus as RequestHandler);
router.post('/:id/assign-driver', checkRole([UserRole.MAIN_ADMIN]), assignDriver as RequestHandler);

// Driver routes
router.put('/:id/location', checkRole([UserRole.DRIVER]), updateBusLocation as RequestHandler);

// Common routes
router.get('/locations', checkRole([UserRole.STATION_ADMIN]), getBusLocations as RequestHandler);
router.get('/:id/tracking', getBusTrackingInfo as RequestHandler);
router.get('/route/:startStationId/:endStationId', calculateRoute as RequestHandler);

export default router; 