import express from 'express';
import { 
  sendNotificationToAll,
  sendNotificationToDriver,
  getNotifications,
  markNotificationAsRead
} from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Send notification to all users (station admin only)
router.post('/broadcast', authenticateToken, sendNotificationToAll);

// Send notification to specific driver (station admin only)
router.post('/driver', authenticateToken, sendNotificationToDriver);

// Get notifications for the current user
router.get('/', authenticateToken, getNotifications);

// Mark notification as read
router.patch('/:notificationId/read', authenticateToken, markNotificationAsRead);

export default router; 