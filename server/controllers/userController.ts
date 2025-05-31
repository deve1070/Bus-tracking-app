import { Request, Response } from 'express';
import { User } from '../models';
import { UserRole } from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

// Get all users
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').populate('stationId');
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch user' });
  }
};

// Create new user
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, phoneNumber, username, stationId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { username }
      ]
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || UserRole.DRIVER,
      phoneNumber,
      username,
      stationId: role === UserRole.STATION_ADMIN ? stationId : undefined
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;

    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    console.error('User creation error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: Object.values(error.errors).map((err: any) => err.message)
      });
    }
    res.status(400).json({ error: 'User creation failed', details: error.message });
  }
};

// Update user
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email, password, firstName, lastName, role, phoneNumber, username, stationId } = req.body;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for duplicate email/username if they're being changed
    if (email !== user.email || username !== user.username) {
      const existingUser = await User.findOne({
        _id: { $ne: id },
        $or: [
          { email },
          { username }
        ]
      });

      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({ error: 'Email already registered' });
        }
        if (existingUser.username === username) {
          return res.status(400).json({ error: 'Username already taken' });
        }
      }
    }

    // Update user fields
    const updateData: any = {
      email,
      firstName,
      lastName,
      role,
      phoneNumber,
      username,
      stationId: role === UserRole.STATION_ADMIN ? stationId : undefined
    };

    // Only update password if provided
    if (password) {
      updateData.password = password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error: any) {
    console.error('User update error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: Object.values(error.errors).map((err: any) => err.message)
      });
    }
    res.status(400).json({ error: 'User update failed', details: error.message });
  }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete user' });
  }
}; 