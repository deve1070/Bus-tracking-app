import express, { RequestHandler } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { auth, checkRole } from '../middleware/auth';
import { UserRole } from '../models';

const router = express.Router();

// Get settings (public)
router.get('/', getSettings as RequestHandler);

// Update settings (main admin only)
router.post('/', auth, checkRole([UserRole.MAIN_ADMIN]), updateSettings as RequestHandler);

export default router; 