import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemSettings extends Document {
  systemName: string;
  contactEmail: string;
  notificationsEnabled: boolean;
  maintenanceMode: boolean;
  autoAssignDrivers: boolean;
  defaultLanguage: string;
  timeZone: string;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const systemSettingsSchema = new Schema<ISystemSettings>({
  systemName: {
    type: String,
    required: true,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  autoAssignDrivers: {
    type: Boolean,
    default: true
  },
  defaultLanguage: {
    type: String,
    enum: ['en', 'es', 'fr'],
    default: 'en'
  },
  timeZone: {
    type: String,
    default: 'UTC'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export const SystemSettings = mongoose.model<ISystemSettings>('SystemSettings', systemSettingsSchema); 