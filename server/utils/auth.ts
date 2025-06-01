import jwt from 'jsonwebtoken';
import { Request } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

export const verifyToken = async (token: string): Promise<DecodedToken | null> => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

export const generateToken = (user: { id: string; email: string; role: string }): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const getTokenFromRequest = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || !token) return null;

  return token;
}; 