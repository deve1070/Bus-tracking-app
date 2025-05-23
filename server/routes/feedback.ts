import express, { RequestHandler } from 'express';
import {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  respondToFeedback,
  updateFeedbackStatus,
  getFeedbackAnalytics
} from '../controllers/feedbackController';
import { auth, checkRole } from '../middleware/auth';
import { UserRole } from '../models';

const router = express.Router();

// Public routes (no authentication required)
router.post('/', createFeedback as RequestHandler);
router.get('/:id', getFeedbackById as RequestHandler);

// Protected routes (require authentication)
router.use(auth);

// Routes accessible by main admin and station admin
router.get('/', checkRole([UserRole.MAIN_ADMIN]), getFeedbacks as RequestHandler);
router.post('/:id/respond', checkRole([UserRole.MAIN_ADMIN]), respondToFeedback as RequestHandler);
router.put('/:id/status', checkRole([UserRole.MAIN_ADMIN]), updateFeedbackStatus as RequestHandler);

// Analytics route (main admin only)
router.get('/analytics/overview', checkRole([UserRole.MAIN_ADMIN]), getFeedbackAnalytics as RequestHandler);

export default router; 