import mongoose, { Document, Schema } from 'mongoose';

export interface IRoute extends Document {
  routeNumber: string;
  name: string;
  description?: string;
  stations: mongoose.Types.ObjectId[]; // Array of station IDs in order
  totalDistance: number; // in kilometers
  estimatedDuration: number; // in minutes
  assignedBuses: mongoose.Types.ObjectId[]; // Array of bus IDs assigned to this route
}

const routeSchema = new Schema<IRoute>({
  routeNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  stations: [{
    type: Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  }],
  totalDistance: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedDuration: {
    type: Number,
    required: true,
    min: 0
  },
  assignedBuses: [{
    type: Schema.Types.ObjectId,
    ref: 'Bus'
  }]
}, {
  timestamps: true
});

// No need for additional indexes since routeNumber is already unique in schema

export const Route = mongoose.model<IRoute>('Route', routeSchema); 