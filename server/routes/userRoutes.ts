import express, { RequestHandler } from 'express';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';
import { UserRole } from '../models';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all users (admin only)
router.get('/', checkRole([UserRole.MAIN_ADMIN]), getUsers as RequestHandler);

// Get user by ID (admin only)
router.get('/:id', checkRole([UserRole.MAIN_ADMIN]), getUserById as RequestHandler);

// Create new user (admin only)
router.post('/', checkRole([UserRole.MAIN_ADMIN]), createUser as RequestHandler);

// Update user (admin only)
router.put('/:id', checkRole([UserRole.MAIN_ADMIN]), updateUser as RequestHandler);

// Delete user (admin only)
router.delete('/:id', checkRole([UserRole.MAIN_ADMIN]), deleteUser as RequestHandler);

export default router; 