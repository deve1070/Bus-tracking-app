"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.resetPassword = exports.forgotPassword = void 0;
const passwordService_1 = require("../services/passwordService");
// Request password reset
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        yield passwordService_1.PasswordService.sendPasswordResetEmail(email);
        res.json({ message: 'Password reset email sent successfully' });
    }
    catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(500).json({ error: 'Failed to send password reset email' });
    }
});
exports.forgotPassword = forgotPassword;
// Reset password with token
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }
        // Validate password strength
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        yield passwordService_1.PasswordService.resetPassword(token, newPassword);
        res.json({ message: 'Password reset successful' });
    }
    catch (error) {
        if (error.message === 'Invalid or expired reset token') {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        res.status(500).json({ error: 'Failed to reset password' });
    }
});
exports.resetPassword = resetPassword;
// Change password (for authenticated users)
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }
        // Validate password strength
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        yield passwordService_1.PasswordService.changePassword(userId, currentPassword, newPassword);
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(500).json({ error: 'Failed to change password' });
    }
});
exports.changePassword = changePassword;
