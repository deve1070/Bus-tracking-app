import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import {
  register,
  login,
  getProfile,
  changePassword
} from '../controllers/authController';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/auth';
import { UserRole, User } from '../models';
import jwt from 'jsonwebtoken';

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

// Check if this is the first user registration
const isFirstUser = async () => {
  const count = await User.countDocuments();
  console.log('Current user count:', count);
  return count === 0;
};

// Public routes
router.post('/register', auth, checkRole([UserRole.MAIN_ADMIN]), async (req: AuthRequest, res: Response) => {
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

// Login route (public)
router.post('/login', login as RequestHandler);

// Protected routes
router.use(auth);
router.get('/profile', getProfile as RequestHandler);
router.post('/change-password', changePassword as RequestHandler);

export default router; 