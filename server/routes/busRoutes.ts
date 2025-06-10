import express, { RequestHandler } from 'express';
import { authenticateToken, checkRole } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  createBus,
  getBuses,
  getBusById,
  updateBus,
  deleteBus,
  getBusTrackingInfo,
  calculateRoute,
  getStationBuses
} from '../controllers/busController';

const router = express.Router();

// Create a new bus (admin only)
router.post('/', authenticateToken, checkRole([UserRole.MAIN_ADMIN]), createBus as RequestHandler);

// Get all buses
router.get('/', authenticateToken, getBuses as RequestHandler);

// Get station buses (for station admin)
router.get('/station', authenticateToken, checkRole([UserRole.STATION_ADMIN]), getStationBuses as RequestHandler);

// Get a specific bus
router.get('/:id', authenticateToken, getBusById as RequestHandler);

// Update a bus (admin or station admin)
router.put('/:busId', authenticateToken, checkRole([UserRole.MAIN_ADMIN, UserRole.STATION_ADMIN]), updateBus as RequestHandler);

// Delete a bus (admin only)
router.delete('/:id', authenticateToken, checkRole([UserRole.MAIN_ADMIN]), deleteBus as RequestHandler);

// Get bus tracking info
router.get('/:id/tracking', getBusTrackingInfo as RequestHandler);

// Calculate route between stations
router.get('/route/:startStationId/:endStationId', calculateRoute as RequestHandler);

export default router; 