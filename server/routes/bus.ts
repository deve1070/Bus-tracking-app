import express, { RequestHandler } from 'express';
import {
  createBus,
  updateBus,
  deleteBus,
  getBuses,
  getBusById,
  updateBusLocation,
  assignDriver,
  calculateRoute,
  getBusTrackingInfo
} from '../controllers/busController';
import { auth, checkRole } from '../middleware/auth';
import { UserRole } from '../models';

const router = express.Router();


// Route for calculating routes between stations (accessible by all users)
router.get('/route/:startStationId/:endStationId', calculateRoute as RequestHandler);

// Route for getting detailed bus tracking information (accessible by all authenticated users)
router.get('/:id/tracking', getBusTrackingInfo as RequestHandler);
// All routes require authentication
router.use(auth);

// Routes accessible by main admin and station admin
router.post('/', checkRole([UserRole.MAIN_ADMIN]), createBus as RequestHandler);
router.put('/:id', checkRole([UserRole.MAIN_ADMIN]), updateBus as RequestHandler);
router.delete('/:id', checkRole([UserRole.MAIN_ADMIN]), deleteBus as RequestHandler);
router.get('/', getBuses as RequestHandler);
router.get('/:id', getBusById as RequestHandler);

// Routes for bus location updates (accessible by drivers)
router.post('/:id/location', checkRole([UserRole.DRIVER]), updateBusLocation as RequestHandler);

// Route for assigning drivers (main admin only)
router.post('/:id/assign-driver', checkRole([UserRole.MAIN_ADMIN]), assignDriver as RequestHandler);



export default router; 