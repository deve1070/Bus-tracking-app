import mongoose, { Document, Schema } from 'mongoose';

export interface IStation extends Document {
  name: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  description?: string;
  adminId?: mongoose.Types.ObjectId;
  stationId?: string;
}

const stationSchema = new Schema<IStation>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  address: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  stationId: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Create geospatial index for location queries
stationSchema.index({ location: '2dsphere' });

export const Station = mongoose.model<IStation>('Station', stationSchema); 