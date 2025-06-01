import { Request, Response } from 'express';
import { User } from '../models';
import { UserRole, IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

// Get all users
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('stationId')
      .populate('busId');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
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
    const { email, password, firstName, lastName, role, phoneNumber, username, stationId, busId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      phoneNumber,
      username,
      stationId: role === UserRole.STATION_ADMIN ? stationId : undefined,
      busId: role === UserRole.DRIVER ? busId : undefined
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update user
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email, password, firstName, lastName, role, phoneNumber, username, stationId, busId } = req.body;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields
    user.email = email || user.email;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.role = role || user.role;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.username = username || user.username;
    user.stationId = role === UserRole.STATION_ADMIN ? stationId : undefined;
    user.busId = role === UserRole.DRIVER ? busId : undefined;

    if (password) {
      user.password = password;
    }

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
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