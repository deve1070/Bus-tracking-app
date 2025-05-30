import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models';

interface AuthRequest extends Request {
  user?: {
    role: UserRole;
  };
}

export const checkRole = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}; 