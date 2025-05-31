import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export enum UserRole {
  MAIN_ADMIN = 'MainAdmin',
  STATION_ADMIN = 'StationAdmin',
  DRIVER = 'Driver',
  PASSENGER = 'Passenger'
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber: string;
  username: string;
  stationId?: mongoose.Types.ObjectId;
  busId?: mongoose.Types.ObjectId;
  firebaseUid?: string;
  deviceToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  stationId: {
    type: Schema.Types.ObjectId,
    ref: 'Station',
    required: function() {
      return this.role === UserRole.STATION_ADMIN;
    }
  },
  busId: {
    type: Schema.Types.ObjectId,
    ref: 'Bus',
    required: function() {
      return this.role === UserRole.DRIVER;
    }
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
    required: false
  },
  deviceToken: {
    type: String,
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Only keep the resetPasswordToken index since it's not defined in the schema
userSchema.index({ resetPasswordToken: 1 });

export const User = mongoose.model<IUser>('User', userSchema); 