import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import stationRoutes from './stationRoutes';
import busRoutes from './busRoutes';
import notificationRoutes from './notificationRoutes';

const router = express.Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/users', userRoutes);
router.use('/stations', stationRoutes);
router.use('/buses', busRoutes);
router.use('/notifications', notificationRoutes);

export default router; 