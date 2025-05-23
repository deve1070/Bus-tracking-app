import express, { RequestHandler } from 'express';
import {
  forgotPassword,
  resetPassword,
  changePassword
} from '../controllers/passwordController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/forgot', forgotPassword as RequestHandler);
router.post('/reset', resetPassword as RequestHandler);

// Protected route (requires authentication)
router.post('/change', auth, changePassword as RequestHandler);

export default router; 