import express, { RequestHandler } from 'express';
import {
  getBusRouteInfo,
  getRouteBusesInfo,
  getAllRoutesInfo
} from '../controllers/routeInfoController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Public routes (no authentication required)
router.get('/bus/:busId', getBusRouteInfo as RequestHandler);
router.get('/route/:routeId', getRouteBusesInfo as RequestHandler);
router.get('/all', getAllRoutesInfo as RequestHandler);

// All routes require authentication
router.use(auth);

export default router; 