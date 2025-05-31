import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { Payment, Route } from '../models';
import { config } from '../config';

interface AuthRequest extends Request {
  user?: any;
}

interface PaymentRequest extends Request {
  user?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// Estimate fare for a route
export const estimateFare = async (req: AuthRequest, res: Response) => {
  try {
    const { routeId } = req.params;

    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // Calculate fare based on route distance or fixed price
    const estimatedFare = (route as any).fare || 0;

    res.json({
      routeId,
      estimatedFare,
      currency: 'ETB'
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to estimate fare' });
  }
};

// Initialize payment
export const initializePayment = async (req: PaymentRequest, res: Response) => {
  try {
    const { routeId, amount, method } = req.body;
    const deviceId = req.headers['x-device-id'] as string;

    if (!routeId || !amount || !method) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    // Generate unique transaction reference
    const tx_ref = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const payment = new Payment({
      user: req.user?._id,
      deviceId,
      amount,
      route: routeId,
      transactionId: tx_ref,
      method,
      status: 'pending'
    });

    await payment.save();

    // Initialize payment with Chapa
    const paymentData = await PaymentService.initializePayment({
      amount,
      currency: 'ETB',
      email: req.user?.email || 'anonymous@example.com',
      firstName: req.user?.firstName || 'Anonymous',
      lastName: req.user?.lastName || 'User',
      tx_ref,
      callback_url: `${config.apiUrl}/api/payments/verify`,
      return_url: `${config.clientUrl}/payment/status`
    });

    // Generate QR code if method is mobile money
    let qrCode = null;
    if (method === 'Telebirr' || method === 'CBEBirr') {
      const qrData = await PaymentService.generateQRCode({
        amount,
        currency: 'ETB',
        tx_ref
      });

      if (qrData && typeof qrData === 'object' && 'data' in qrData && qrData.data && typeof qrData.data === 'object' && 'qr_code' in qrData.data) {
        qrCode = qrData.data.qr_code as string;
        payment.metadata = { qrCode };
        await payment.save();
      }
    }

    res.json({
      message: 'Payment initialized successfully',
      paymentId: payment._id,
      checkoutUrl: (paymentData as any).data.checkout_url,
      qrCode
    });
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({ message: 'Error initializing payment' });
  }
};

// Verify payment
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { tx_ref } = req.query;

    if (!tx_ref) {
      return res.status(400).json({ message: 'Transaction reference is required' });
    }

    const payment = await Payment.findOne({ transactionId: tx_ref });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Verify payment with Chapa
    const verification = await PaymentService.verifyPayment(tx_ref as string);

    // Update payment status
    payment.status = (verification as any).status === 'success' ? 'COMPLETED' : 'FAILED';
    payment.receiptUrl = (verification as any).receipt_url;
    await payment.save();

    res.json({
      message: 'Payment verification completed',
      status: payment.status,
      receiptUrl: payment.receiptUrl
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};

// Get payment history
export const getPaymentHistory = async (req: PaymentRequest, res: Response) => {
  try {
    const deviceId = req.headers['x-device-id'] as string;
    const query = req.user ? { user: req.user._id } : { deviceId };

    const payments = await Payment.find(query)
      .populate('route')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({ message: 'Error getting payment history' });
  }
};

// Download receipt
export const getPaymentReceipt = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (!payment.receiptUrl) {
      return res.status(404).json({ message: 'Receipt not available' });
    }

    res.json({ receiptUrl: payment.receiptUrl });
  } catch (error) {
    console.error('Error getting payment receipt:', error);
    res.status(500).json({ message: 'Error getting payment receipt' });
  }
}; 