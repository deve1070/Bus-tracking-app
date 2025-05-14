// server/models/index.ts
import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';

// Interfaces for TypeScript
interface IGeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'MainAdmin' | 'StationAdmin' | 'Driver' | 'Passenger';
  savedRoutes: Types.ObjectId[];
  station?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

interface IBus extends Document {
  number: string;
  route?: Types.ObjectId | null;
  status: 'active' | 'inactive';
  location: IGeoPoint;
  driver?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

interface IRoute extends Document {
  name: string;
  stops: Types.ObjectId[];
  schedule: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IStop extends Document {
  name: string;
  location: IGeoPoint;
  createdAt: Date;
  updatedAt: Date;
}

interface IStation extends Document {
  name: string;
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
  user: Types.ObjectId;
  amount: number;
  route: Types.ObjectId;
  status: 'pending' | 'completed' | 'failed';
  transactionId: string;
  method: 'Telebirr' | 'CBEBirr' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['MainAdmin', 'StationAdmin', 'Driver', 'Passenger'], required: true },
  savedRoutes: [{ type: Schema.Types.ObjectId, ref: 'Route' }],
  station: { type: Schema.Types.ObjectId, ref: 'Station', default: null }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Bus Schema
const busSchema = new Schema<IBus>({
  number: { type: String, required: true, unique: true, trim: true },
  route: { type: Schema.Types.ObjectId, ref: 'Route', default: null },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  driver: { type: Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

busSchema.index({ location: '2dsphere' });

// Route Schema
const routeSchema = new Schema<IRoute>({
  name: { type: String, required: true, trim: true },
  stops: [{ type: Schema.Types.ObjectId, ref: 'Stop' }],
  schedule: { type: String, required: true }
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
  admin: { type: Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

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
  user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
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
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  route: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  transactionId: { type: String, unique: true, required: true },
  method: { type: String, enum: ['Telebirr', 'CBEBirr', 'other'], required: true }
}, { timestamps: true });

paymentSchema.index({ user: 1, createdAt: -1 });

// Models
const User = model<IUser>('User', userSchema);
const Bus = model<IBus>('Bus', busSchema);
const Route = model<IRoute>('Route', routeSchema);
const Stop = model<IStop>('Stop', stopSchema);
const Station = model<IStation>('Station', stationSchema);
const Schedule = model<ISchedule>('Schedule', scheduleSchema);
const Notification = model<INotification>('Notification', notificationSchema);
const Feedback = model<IFeedback>('Feedback', feedbackSchema);
const Payment = model<IPayment>('Payment', paymentSchema);

export { User, Bus, Route, Stop, Station, Schedule, Notification, Feedback, Payment };

// server/app.ts
import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI as string, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err: Error) => console.error(err));

app.get('/', (req: Request, res: Response) => res.send('API running'));

export default app;

// server/server.ts
import http from 'http';
import { Server } from 'socket.io';
import app from './app';

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// server/tsconfig.json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}