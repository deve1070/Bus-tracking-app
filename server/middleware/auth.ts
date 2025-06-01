import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models';

export interface AuthRequest extends Request {
    user?: any;
}

// List of public routes that don't require authentication
const publicRoutes = [
    '/login',
    '/send-reset-code',
    '/verify-reset-code',
    '/reset-password'
];

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Skip authentication for public routes
        const isPublicRoute = publicRoutes.some(route => req.path.endsWith(route));
        if (isPublicRoute) {
            console.log('Skipping auth for public route:', req.path);
            return next();
        }

        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findOne({ _id: (decoded as any)._id });

        if (!user) {
            throw new Error();
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate.' });
    }
};

export const checkRole = (roles: UserRole[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }

            if (!roles.includes(req.user.role)) {
                throw new Error('Insufficient permissions');
            }

            next();
        } catch (error) {
            res.status(403).json({ error: 'Access denied.' });
        }
    };
};

export const checkStationAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new Error('User not authenticated');
        }

        if (req.user.role === UserRole.MAIN_ADMIN) {
            return next();
        }

        if (req.user.role === UserRole.STATION_ADMIN && req.user.stationId) {
            const stationId = req.params.stationId || req.body.stationId;
            if (stationId && stationId.toString() === req.user.stationId.toString()) {
                return next();
            }
        }

        throw new Error('Insufficient station access');
    } catch (error) {
        res.status(403).json({ error: 'Access denied to station.' });
    }
};