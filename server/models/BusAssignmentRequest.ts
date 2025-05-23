import mongoose, { Document, Schema } from 'mongoose';

export interface IBusAssignmentRequest extends Document {
  stationId: mongoose.Types.ObjectId;
  routeId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId; // station admin who made the request
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  requestedBuses: number;
  approvedBuses?: number;
  responseNote?: string;
  respondedBy?: mongoose.Types.ObjectId; // main admin who responded
}

const busAssignmentRequestSchema = new Schema<IBusAssignmentRequest>({
  stationId: {
    type: Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  routeId: {
    type: Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  reason: {
    type: String,
    required: true
  },
  requestedBuses: {
    type: Number,
    required: true,
    min: 1
  },
  approvedBuses: {
    type: Number,
    min: 0
  },
  responseNote: {
    type: String
  },
  respondedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export const BusAssignmentRequest = mongoose.model<IBusAssignmentRequest>('BusAssignmentRequest', busAssignmentRequestSchema); 