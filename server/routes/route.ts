import express, { RequestHandler } from 'express';
import { createRoute, getRoutes, getRouteById } from '../controllers/routeController';
import { auth, checkRole } from '../middleware/auth';
import { UserRole } from '../models';

const router = express.Router();

// Create route (main admin only)
router.post('/', auth, checkRole([UserRole.MAIN_ADMIN]), createRoute);

// Get all routes (public)
router.get('/', getRoutes);

// Get route by ID (public)
router.get('/:id', getRouteById as RequestHandler);

export default router; 