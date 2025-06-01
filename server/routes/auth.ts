import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import {
  register,
  login,
  getProfile,
  changePassword,
  logout
} from '../controllers/authController';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/auth';
import { UserRole, User } from '../models';
import jwt from 'jsonwebtoken';
import { sendResetCode, verifyResetCode, resetPassword } from '../controllers/passwordResetController';

// Define AuthRequest interface
interface AuthRequest extends Request {
  user?: any;
}

// Generate JWT token
const generateToken = (user: any) => {
  return jwt.sign(
    { _id: user._id },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

const router = express.Router();

// Public routes (no auth required)
router.post('/login', login as RequestHandler);

// Password reset routes (public)
const sendResetCodeHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }
    await sendResetCode(req, res);
  } catch (error) {
    console.error('Error in send-reset-code route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const verifyResetCodeHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ message: 'Email and code are required' });
      return;
    }
    await verifyResetCode(req, res);
  } catch (error) {
    console.error('Error in verify-reset-code route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const resetPasswordHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      res.status(400).json({ message: 'Email, code, and new password are required' });
      return;
    }
    await resetPassword(req, res);
  } catch (error) {
    console.error('Error in reset-password route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

router.post('/send-reset-code', sendResetCodeHandler);
router.post('/verify-reset-code', verifyResetCodeHandler);
router.post('/reset-password', resetPasswordHandler);

// Protected routes (require auth)
router.use(auth);

router.get('/profile', getProfile as RequestHandler);
router.post('/change-password', changePassword as RequestHandler);
router.post('/logout', logout as RequestHandler);

// Registration route (protected)
router.post('/register', checkRole([UserRole.MAIN_ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, phoneNumber, username } = req.body;
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      phoneNumber,
      username
    });
    await user.save();
    res.status(201).json({ user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }, token: generateToken(user) });
  } catch (error) {
    res.status(400).json({ error: 'Failed to register user' });
  }
});

export default router; 