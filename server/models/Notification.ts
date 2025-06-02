import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId | 'all';
  type: 'broadcast' | 'driver';
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: Schema.Types.Mixed,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['broadcast', 'driver'],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ sender: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema); 