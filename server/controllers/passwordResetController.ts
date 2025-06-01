import { Request, Response } from 'express';
import { User } from '../models';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Store reset codes in memory (in production, use Redis or similar)
const resetCodes = new Map<string, { code: string; expires: Date }>();

export const sendResetCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store the code
    resetCodes.set(email, { code, expires });

    // In production, send the code via email
    // For development, we'll just return it
    res.json({ message: 'Reset code sent', code });
  } catch (error) {
    console.error('Error sending reset code:', error);
    res.status(500).json({ message: 'Failed to send reset code' });
  }
};

export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    const resetData = resetCodes.get(email);

    if (!resetData) {
      return res.status(400).json({ message: 'No reset code found for this email' });
    }

    if (resetData.expires < new Date()) {
      resetCodes.delete(email);
      return res.status(400).json({ message: 'Reset code has expired' });
    }

    if (resetData.code !== code) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    res.json({ message: 'Code verified successfully' });
  } catch (error) {
    console.error('Error verifying reset code:', error);
    res.status(500).json({ message: 'Failed to verify reset code' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    const resetData = resetCodes.get(email);

    if (!resetData) {
      return res.status(400).json({ message: 'No reset code found for this email' });
    }

    if (resetData.expires < new Date()) {
      resetCodes.delete(email);
      return res.status(400).json({ message: 'Reset code has expired' });
    }

    if (resetData.code !== code) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Remove the used reset code
    resetCodes.delete(email);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
}; 