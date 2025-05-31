import express, { RequestHandler } from 'express';
import {
  estimateFare,
  initializePayment,
  verifyPayment,
  getPaymentHistory,
  getPaymentReceipt
} from '../controllers/paymentController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Public routes (no authentication required)
router.get('/estimate/:routeId', estimateFare as RequestHandler);
router.post('/initialize', initializePayment as RequestHandler);

// All routes require authentication
router.use(auth);

// Payment verification (public endpoint for Chapa callback)
router.get('/verify', verifyPayment as RequestHandler);

// Payment history
router.get('/history', getPaymentHistory as RequestHandler);

// Download receipt
router.get('/receipt/:paymentId', getPaymentReceipt as RequestHandler);

export default router; 