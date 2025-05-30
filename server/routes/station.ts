import express, { RequestHandler } from 'express';
import {
  createStation,
  updateStation,
  deleteStation,
  getStations,
  getStationById,
  assignStationAdmin,
  getNearbyStations,
  getStationByName
} from '../controllers/stationController';
import { auth, checkRole, checkStationAccess } from '../middleware/auth';
import { UserRole } from '../models';

const router = express.Router();

// Public routes
router.get('/', getStations as RequestHandler);
router.get('/nearby', getNearbyStations as RequestHandler);
router.get('/name/:name', getStationByName as RequestHandler);
router.get('/:id', getStationById as RequestHandler);

// Protected routes (Main Admin only)
router.post('/', auth, checkRole([UserRole.MAIN_ADMIN]), createStation as RequestHandler);
router.put('/:id', auth, checkRole([UserRole.MAIN_ADMIN]), updateStation as RequestHandler);
router.delete('/:id', auth, checkRole([UserRole.MAIN_ADMIN]), deleteStation as RequestHandler);
router.post('/:id/assign-admin', auth, checkRole([UserRole.MAIN_ADMIN]), assignStationAdmin as RequestHandler);

export default router; 