import { Request, Response } from 'express';
import { User } from '../models';
import nodemailer from 'nodemailer';
import { config } from '../config';
import bcrypt from 'bcrypt';

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  debug: true // Enable debug logging
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Transporter verification error:', error);
  } else {
    console.log('Server is ready to send emails');
  }
});

export const sendResetCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    console.log('Sending reset code to:', email);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Generate a random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update only the reset code fields
    await User.updateOne(
      { _id: user._id },
      { 
        $set: {
          resetCode,
          resetCodeExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        }
      }
    );

    // Send reset code via email
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You have requested to reset your password. Please use the following verification code:</p>
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; margin: 0; font-size: 32px;">${resetCode}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
          </div>
        `
      };

      console.log('Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');

      res.status(200).json({ 
        message: 'Reset code sent to your email',
        code: resetCode // Only for development, remove in production
      });
    } catch (emailError: any) {
      console.error('Email error details:', {
        message: emailError.message,
        code: emailError.code,
        command: emailError.command,
        response: emailError.response,
        responseCode: emailError.responseCode,
        stack: emailError.stack
      });
      res.status(500).json({ 
        message: 'Failed to send reset code',
        error: emailError.message 
      });
    }
  } catch (error) {
    console.error('Error in sendResetCode:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyResetCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ 
      email,
      resetCode: code,
      resetCodeExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset code' });
      return;
    }

    res.status(200).json({ message: 'Reset code verified' });
  } catch (error) {
    console.error('Error in verifyResetCode:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code, newPassword } = req.body;
    console.log('Reset password request for:', { email, code });

    const user = await User.findOne({ 
      email,
      resetCode: code,
      resetCodeExpires: { $gt: new Date() }
    });

    if (!user) {
      console.log('User not found or invalid code:', { email, code });
      res.status(400).json({ message: 'Invalid or expired reset code' });
      return;
    }

    console.log('Found user for password reset:', {
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Update password directly - let the User model's pre-save middleware handle hashing
    user.password = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    
    // Save with validation disabled to avoid stationId requirement
    await user.save({ validateBeforeSave: false });
    console.log('Password reset successful for user:', email);

    // Verify the password was saved correctly
    const updatedUser = await User.findById(user._id).select('+password');
    console.log('Password verification after save:', {
      hasPassword: !!updatedUser?.password,
      passwordLength: updatedUser?.password?.length
    });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 