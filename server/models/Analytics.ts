import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalytics extends Document {
  type: 'ROUTE' | 'BUS' | 'STATION' | 'PAYMENT' | 'FEEDBACK';
  data: {
    routeId?: mongoose.Types.ObjectId;
    busId?: mongoose.Types.ObjectId;
    stationId?: mongoose.Types.ObjectId;
    timestamp: Date;
    metrics: {
      passengerCount?: number;
      revenue?: number;
      averageSpeed?: number;
      delayTime?: number;
      occupancyRate?: number;
      feedbackCount?: {
        positive: number;
        negative: number;
        neutral: number;
      };
      paymentStats?: {
        total: number;
        successful: number;
        failed: number;
        averageAmount: number;
      };
    };
  };
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  createdAt: Date;
  updatedAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>({
  type: {
    type: String,
    enum: ['ROUTE', 'BUS', 'STATION', 'PAYMENT', 'FEEDBACK'],
    required: true
  },
  data: {
    routeId: { type: Schema.Types.ObjectId, ref: 'Route' },
    busId: { type: Schema.Types.ObjectId, ref: 'Bus' },
    stationId: { type: Schema.Types.ObjectId, ref: 'Station' },
    timestamp: { type: Date, required: true },
    metrics: {
      passengerCount: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      averageSpeed: { type: Number, default: 0 },
      delayTime: { type: Number, default: 0 },
      occupancyRate: { type: Number, default: 0 },
      feedbackCount: {
        positive: { type: Number, default: 0 },
        negative: { type: Number, default: 0 },
        neutral: { type: Number, default: 0 }
      },
      paymentStats: {
        total: { type: Number, default: 0 },
        successful: { type: Number, default: 0 },
        failed: { type: Number, default: 0 },
        averageAmount: { type: Number, default: 0 }
      }
    }
  },
  period: {
    type: String,
    enum: ['DAILY', 'WEEKLY', 'MONTHLY'],
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
analyticsSchema.index({ type: 1, 'data.timestamp': 1 });
analyticsSchema.index({ 'data.routeId': 1, 'data.timestamp': 1 });
analyticsSchema.index({ 'data.busId': 1, 'data.timestamp': 1 });
analyticsSchema.index({ 'data.stationId': 1, 'data.timestamp': 1 });

export const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema); 