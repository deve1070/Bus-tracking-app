import express, { RequestHandler } from 'express';
import {
  createBusAssignmentRequest,
  getPendingRequests,
  respondToRequest,
  getStationRequests
} from '../controllers/busAssignmentRequestController';
import { auth, checkRole } from '../middleware/auth';
import { UserRole } from '../models';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Station admin routes
router.post('/', checkRole([UserRole.STATION_ADMIN]), createBusAssignmentRequest as RequestHandler);
router.get('/station', checkRole([UserRole.STATION_ADMIN]), getStationRequests as RequestHandler);

// Main admin routes
router.get('/pending', checkRole([UserRole.MAIN_ADMIN]), getPendingRequests as RequestHandler);
router.put('/:id/respond', checkRole([UserRole.MAIN_ADMIN]), respondToRequest as RequestHandler);

export default router; 