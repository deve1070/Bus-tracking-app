import express, { RequestHandler } from 'express';
import {
  createStation,
  updateStation,
  deleteStation,
  getStations,
  getStationById,
  assignStationAdmin,
  getNearbyStations,
  getStationByName,
  getStationStats
} from '../controllers/stationController';
import { authenticateToken, checkRole } from '../middleware/auth';
import { UserRole } from '../models';

const router = express.Router();

// Public routes
router.get('/', getStations as RequestHandler);
router.get('/nearby', getNearbyStations as RequestHandler);
router.get('/name/:name', getStationByName as RequestHandler);
router.get('/:id', getStationById as RequestHandler);

// Protected routes
router.use(authenticateToken);

// Station admin routes
router.get('/stats', checkRole([UserRole.STATION_ADMIN]), getStationStats as RequestHandler);

// Main admin routes
router.post('/', checkRole([UserRole.MAIN_ADMIN]), createStation as RequestHandler);
router.put('/:id', checkRole([UserRole.MAIN_ADMIN]), updateStation as RequestHandler);
router.delete('/:id', checkRole([UserRole.MAIN_ADMIN]), deleteStation as RequestHandler);
router.post('/:id/assign-admin', checkRole([UserRole.MAIN_ADMIN]), assignStationAdmin as RequestHandler);

export default router; 