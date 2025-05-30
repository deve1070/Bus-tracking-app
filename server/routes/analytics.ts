import express from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get analytics data
router.get('/', authMiddleware, AnalyticsController.getAnalytics);

// Trigger daily analytics calculation (admin only)
router.post('/calculate-daily', authMiddleware, AnalyticsController.calculateDailyAnalytics);

export default router; 