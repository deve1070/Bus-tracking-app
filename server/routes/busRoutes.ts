import express, { RequestHandler } from 'express';
import { authenticateToken } from '../middleware/auth';
import { checkRole } from '../middleware/auth';
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
  getStationBuses
} from '../controllers/busController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Station admin routes
router.post('/', checkRole([UserRole.STATION_ADMIN]), createBus as RequestHandler);
router.put('/:id', checkRole([UserRole.MAIN_ADMIN, UserRole.STATION_ADMIN]), updateBus as RequestHandler);
router.delete('/:id', checkRole([UserRole.STATION_ADMIN]), deleteBus as RequestHandler);
router.get('/locations', checkRole([UserRole.STATION_ADMIN]), getBusLocations as RequestHandler);
router.get('/station', checkRole([UserRole.STATION_ADMIN]), getStationBuses as RequestHandler);

// Driver routes
router.put('/:id/location', checkRole([UserRole.DRIVER]), updateBusLocation as RequestHandler);

// Common routes
router.get('/', getBuses as RequestHandler);
router.get('/:id', getBusById as RequestHandler);
router.get('/:id/tracking', getBusTrackingInfo as RequestHandler);
router.get('/route/:startStationId/:endStationId', calculateRoute as RequestHandler);
router.put('/:id/assign-driver', checkRole([UserRole.STATION_ADMIN]), assignDriver as RequestHandler);

export default router; 