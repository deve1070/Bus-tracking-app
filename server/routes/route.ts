import express, { RequestHandler } from 'express';
import { createRoute, getRoutes, getRouteById, getRouteByName, updateRoute, deleteRoute } from '../controllers/routeController';
import { auth, checkRole } from '../middleware/auth';
import { UserRole } from '../models';

const router = express.Router();

// Public routes
router.get('/', getRoutes as RequestHandler);
router.get('/:id', getRouteById as RequestHandler);
router.get('/name/:name', getRouteByName as RequestHandler);

// Protected routes (Main Admin only)
router.post('/', auth, checkRole([UserRole.MAIN_ADMIN]), createRoute as RequestHandler);
router.put('/:id', auth, checkRole([UserRole.MAIN_ADMIN]), updateRoute as RequestHandler);
router.delete('/:id', auth, checkRole([UserRole.MAIN_ADMIN]), deleteRoute as RequestHandler);

export default router; 