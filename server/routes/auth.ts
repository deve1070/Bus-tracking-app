import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import {
  register,
  login,
  getProfile
} from '../controllers/authController';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/auth';
import { UserRole, User } from '../models';

const router = express.Router();

// Check if this is the first user registration
const isFirstUser = async () => {
  const count = await User.countDocuments();
  return count === 0;
};

// Public routes
router.post('/register', (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const firstUser = await isFirstUser();
    if (firstUser) {
      // Allow registration for the first user
      return register(req, res);
    }
    // For subsequent registrations, check for MainAdmin role
    return checkRole([UserRole.MAIN_ADMIN])(req, res, next);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

// Login route should be public and not require role check
router.post('/login', login as RequestHandler);

// Protected routes
router.use(auth);
router.get('/profile', getProfile as RequestHandler);

export default router; 