// server/models/index.ts
import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';

// Interfaces for TypeScript
interface IGeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// Types and Enums
export enum UserRole {
  MAIN_ADMIN = 'MainAdmin',
  STATION_ADMIN = 'StationAdmin',
  DRIVER = 'Driver',
  PASSENGER = 'Passenger'
}

export type UserRoleType = keyof typeof UserRole;

interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  savedRoutes: Types.ObjectId[];
  station?: Types.ObjectId | null;
  lastLogin?: Date;
  deviceToken?: string;
  createdAt: Date;
  updatedAt: Date;
  isModified: (path: string) => boolean;
  comparePassword: (password: string) => Promise<boolean>;
}

interface IBus extends Document {
  busNumber: string;
  routeNumber: string;
  capacity: number;
  route: {
    stations: Types.ObjectId[];
    estimatedTime?: number;
  };
  schedule: string;
  status: 'active' | 'inactive';
  currentLocation: {
    type: 'Point';
    coordinates: [number, number];
  };
  currentStationId?: Types.ObjectId | null;
  driverId?: Types.ObjectId | null;
  lastUpdateTime?: Date;
  trackingData?: {
    speed: number;
    heading: number;
    lastUpdate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface IRoute extends Document {
  name: string;
  stops: Types.ObjectId[];
  schedule: string;
  createdAt: Date;
  updatedAt: Date;
  fare: number;
}

interface IStop extends Document {
  name: string;
  location: IGeoPoint;
  createdAt: Date;
  updatedAt: Date;
}

interface IStation extends Document {
  name: string;
  location: IGeoPoint;
  admin?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ISchedule extends Document {
  bus: Types.ObjectId;
  route: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface INotification extends Document {
  recipient: Types.ObjectId;
  message: string;
  type: 'delay' | 'routeChange' | 'general';
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IFeedback extends Document {
  user?: Types.ObjectId | null;
  deviceId?: string;
  email?: string | null;
  name?: string | null;
  text: string;
  category: 'complaint' | 'suggestion' | 'other';
  sentiment: 'positive' | 'negative' | 'neutral';
  status: 'open' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

interface IPayment extends Document {
  user?: Types.ObjectId | null;
  deviceId?: string;
  amount: number;
  route: Types.ObjectId;
  status: 'pending' | 'completed' | 'failed';
  transactionId: string;
  method: 'Telebirr' | 'CBEBirr' | 'other';
  metadata?: {
    qrCode?: string;
  };
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IAnonymousPassenger extends Document {
  deviceId: string;
  currentLocation: IGeoPoint;
  lastUpdateTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface IBusAssignmentRequest extends Document {
  driver: Types.ObjectId;
  station: Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  role: { type: String, enum: Object.values(UserRole), required: true },
  savedRoutes: [{ type: Schema.Types.ObjectId, ref: 'Route' }],
  station: { type: Schema.Types.ObjectId, ref: 'Station', default: null },
  lastLogin: { type: Date, default: null },
  deviceToken: { type: String, default: null }
}, { timestamps: true });

userSchema.pre<IUser>('save', async function (this: IUser, next: (err?: Error) => void): Promise<void> {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Add comparePassword method to schema
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Bus Schema
const busSchema = new Schema<IBus>({
  busNumber: { type: String, required: true, unique: true, trim: true },
  routeNumber: { type: String, required: true, unique: true, trim: true },
  capacity: { type: Number, required: true },
  route: {
    stations: [{ type: Schema.Types.ObjectId, ref: 'Stop' }],
    estimatedTime: { type: Number, default: null }
  },
  schedule: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  currentStationId: { type: Schema.Types.ObjectId, ref: 'Station', default: null },
  driverId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  lastUpdateTime: { type: Date, default: null },
  trackingData: {
    speed: { type: Number, default: 0 },
    heading: { type: Number, default: 0 },
    lastUpdate: { type: Date, default: null }
  }
}, { timestamps: true });

busSchema.index({ currentLocation: '2dsphere' });

// Route Schema
const routeSchema = new Schema<IRoute>({
  name: { type: String, required: true, trim: true },
  stops: [{ type: Schema.Types.ObjectId, ref: 'Stop' }],
  schedule: { type: String, required: true },
  fare: { type: Number, required: true }
}, { timestamps: true });

// Stop Schema
const stopSchema = new Schema<IStop>({
  name: { type: String, required: true, trim: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  }
}, { timestamps: true });

stopSchema.index({ location: '2dsphere' });

// Station Schema
const stationSchema = new Schema<IStation>({
  name: { type: String, required: true, trim: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  admin: { type: Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

stationSchema.index({ location: '2dsphere' });

// Schedule Schema
const scheduleSchema = new Schema<ISchedule>({
  bus: { type: Schema.Types.ObjectId, ref: 'Bus', required: true },
  route: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true }
}, { timestamps: true });

// Notification Schema
const notificationSchema = new Schema<INotification>({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, trim: true },
  type: { type: String, enum: ['delay', 'routeChange', 'general'], required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });

// Feedback Schema
const feedbackSchema = new Schema<IFeedback>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  deviceId: { type: String, required: false, trim: true },
  email: { type: String, trim: true, default: null },
  name: { type: String, trim: true, default: null },
  text: { type: String, required: true, trim: true },
  category: { type: String, enum: ['complaint', 'suggestion', 'other'], default: 'other' },
  sentiment: { type: String, enum: ['positive', 'negative', 'neutral'], default: 'neutral' },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' }
}, { timestamps: true });

feedbackSchema.index({ status: 1, createdAt: -1 });

// Payment Schema
const paymentSchema = new Schema<IPayment>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  deviceId: { type: String, required: false, trim: true },
  amount: { type: Number, required: true },
  route: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  transactionId: { type: String, unique: true, required: true },
  method: { type: String, enum: ['Telebirr', 'CBEBirr', 'other'], required: true },
  metadata: {
    qrCode: { type: String }
  },
  receiptUrl: { type: String }
}, { timestamps: true });

// Anonymous Passenger Schema
const anonymousPassengerSchema = new Schema<IAnonymousPassenger>({
  deviceId: { type: String, required: true, unique: true },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  lastUpdateTime: { type: Date, default: Date.now }
}, { timestamps: true });

anonymousPassengerSchema.index({ currentLocation: '2dsphere' });

// Bus Assignment Request Schema
const busAssignmentRequestSchema = new Schema<IBusAssignmentRequest>({
  driver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  station: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

// Create and export models
export const User = model<IUser>('User', userSchema);
export const Bus = model<IBus>('Bus', busSchema);
export const Route = model<IRoute>('Route', routeSchema);
export const Stop = model<IStop>('Stop', stopSchema);
export const Station = model<IStation>('Station', stationSchema);
export const Schedule = model<ISchedule>('Schedule', scheduleSchema);
export const Notification = model<INotification>('Notification', notificationSchema);
export const Feedback = model<IFeedback>('Feedback', feedbackSchema);
export const Payment = model<IPayment>('Payment', paymentSchema);
export const AnonymousPassenger = model<IAnonymousPassenger>('AnonymousPassenger', anonymousPassengerSchema);
export const BusAssignmentRequest = model<IBusAssignmentRequest>('BusAssignmentRequest', busAssignmentRequestSchema);

export type {
  IUser,
  IBus,
  IRoute,
  IStop,
  IStation,
  ISchedule,
  INotification,
  IFeedback,
  IPayment,
  IAnonymousPassenger,
  IBusAssignmentRequest
};
