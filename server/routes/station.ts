import express, { RequestHandler } from 'express';
import {
  createStation,
  updateStation,
  deleteStation,
  getStations,
  getStationById,
  assignStationAdmin,
  getNearbyStations
} from '../controllers/stationController';
import { auth, checkRole, checkStationAccess } from '../middleware/auth';
import { UserRole } from '../models';

const router = express.Router();

// Route for getting nearby stations (accessible by all users)
router.get('/nearby', getNearbyStations as RequestHandler);

// All other routes require authentication
router.use(auth);

// Routes accessible by main admin
router.post('/', checkRole([UserRole.MAIN_ADMIN]), createStation as RequestHandler);
router.put('/:id', checkRole([UserRole.MAIN_ADMIN]), updateStation as RequestHandler);
router.delete('/:id', checkRole([UserRole.MAIN_ADMIN]), deleteStation as RequestHandler);

// Routes accessible by main admin and station admin
router.get('/', getStations as RequestHandler);
router.get('/:id', getStationById as RequestHandler);

// Route for assigning station admin (main admin only)
router.post('/:id/assign-admin', checkRole([UserRole.MAIN_ADMIN]), assignStationAdmin as RequestHandler);

export default router; 