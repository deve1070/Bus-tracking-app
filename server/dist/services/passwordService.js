"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.PasswordService = void 0;
const admin = __importStar(require("firebase-admin"));
const models_1 = require("../models");
class PasswordService {
    /**
     * Send password reset email
     */
    static sendPasswordResetEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if user exists
                const userDoc = yield models_1.User.findOne({ email });
                if (!userDoc) {
                    throw new Error('User not found');
                }
                const user = userDoc.toObject();
                // Generate password reset link using Firebase
                const resetLink = yield admin.auth().generatePasswordResetLink(email);
                // Update user with reset token (optional, if you want to track it)
                userDoc.resetPasswordToken = resetLink;
                userDoc.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour expiry
                yield userDoc.save();
                return { message: 'Password reset email sent successfully', resetLink };
            }
            catch (error) {
                console.error('Error sending password reset email:', error);
                throw error;
            }
        });
    }
    /**
     * Reset password using token
     */
    static resetPassword(token, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find user with valid reset token
                const userDoc = yield models_1.User.findOne({
                    resetPasswordToken: token,
                    resetPasswordExpires: { $gt: Date.now() }
                });
                if (!userDoc) {
                    throw new Error('Invalid or expired reset token');
                }
                const user = userDoc.toObject();
                // Update password in Firebase
                yield admin.auth().updateUser(user.firebaseUid, {
                    password: newPassword
                });
                // Clear reset token fields
                userDoc.resetPasswordToken = undefined;
                userDoc.resetPasswordExpires = undefined;
                yield userDoc.save();
                return { message: 'Password reset successful' };
            }
            catch (error) {
                console.error('Error resetting password:', error);
                throw error;
            }
        });
    }
    /**
     * Change password for authenticated user
     */
    static changePassword(userId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userDoc = yield models_1.User.findById(userId);
                if (!userDoc) {
                    throw new Error('User not found');
                }
                const user = userDoc.toObject();
                // Update password in Firebase
                yield admin.auth().updateUser(user.firebaseUid, {
                    password: newPassword
                });
                return { message: 'Password changed successfully' };
            }
            catch (error) {
                console.error('Error changing password:', error);
                throw error;
            }
        });
    }
}
exports.PasswordService = PasswordService;
