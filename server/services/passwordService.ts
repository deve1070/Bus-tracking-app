import * as admin from 'firebase-admin';
import { config } from '../config';
import { User } from '../models';
import { v4 as uuidv4 } from 'uuid';

export class PasswordService {
  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string) {
    try {
      // Check if user exists
      const userDoc = await User.findOne({ email });
      if (!userDoc) {
        throw new Error('User not found');
      }

      const user = userDoc.toObject() as any;

      // Generate password reset link using Firebase
      const resetLink = await admin.auth().generatePasswordResetLink(email);

      // Update user with reset token (optional, if you want to track it)
      (userDoc as any).resetPasswordToken = resetLink;
      (userDoc as any).resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour expiry
      await userDoc.save();

      return { message: 'Password reset email sent successfully', resetLink };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  /**
   * Reset password using token
   */
  static async resetPassword(token: string, newPassword: string) {
    try {
      // Find user with valid reset token
      const userDoc = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!userDoc) {
        throw new Error('Invalid or expired reset token');
      }

      const user = userDoc.toObject() as any;

      // Update password in Firebase
      await admin.auth().updateUser(user.firebaseUid, {
        password: newPassword
      });

      // Clear reset token fields
      (userDoc as any).resetPasswordToken = undefined;
      (userDoc as any).resetPasswordExpires = undefined;
      await userDoc.save();

      return { message: 'Password reset successful' };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  /**
   * Change password for authenticated user
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      const userDoc = await User.findById(userId);
      if (!userDoc) {
        throw new Error('User not found');
      }

      const user = userDoc.toObject() as any;

      // Update password in Firebase
      await admin.auth().updateUser(user.firebaseUid, {
        password: newPassword
      });

      return { message: 'Password changed successfully' };
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
} 