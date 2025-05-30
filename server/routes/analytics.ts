import express from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get analytics data
router.get('/', auth, AnalyticsController.getAnalytics);

// Trigger daily analytics calculation (admin only)
router.post('/calculate-daily', auth, AnalyticsController.calculateDailyAnalytics);

export default router; 