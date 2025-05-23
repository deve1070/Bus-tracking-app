import mongoose, { Document, Schema } from 'mongoose';

export interface IBus extends Document {
  busNumber: string;
  routeNumber: string;
  capacity: number;
  deviceId: string; // GPS tracker device ID
  currentLocation: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  driverId?: mongoose.Types.ObjectId;
  currentStationId?: mongoose.Types.ObjectId;
  route: {
    stations: mongoose.Types.ObjectId[];
    estimatedTime: number; // in minutes
  };
  schedule: {
    departureTime: string;
    arrivalTime: string;
  };
  lastUpdateTime: Date;
  isOnRoute: boolean;
  currentPassengerCount: number;
  trackingData?: {
    speed: number;
    heading: number;
    lastUpdate: Date;
  };
}

const busSchema = new Schema<IBus>({
  busNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  routeNumber: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 0
  },
  deviceId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  currentLocation: {
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
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
    default: 'INACTIVE'
  },
  driverId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  currentStationId: {
    type: Schema.Types.ObjectId,
    ref: 'Station'
  },
  route: {
    stations: [{
      type: Schema.Types.ObjectId,
      ref: 'Station'
    }],
    estimatedTime: {
      type: Number,
      required: true
    }
  },
  schedule: {
    departureTime: {
      type: String,
      required: true
    },
    arrivalTime: {
      type: String,
      required: true
    }
  },
  lastUpdateTime: {
    type: Date,
    default: Date.now
  },
  isOnRoute: {
    type: Boolean,
    default: false
  },
  currentPassengerCount: {
    type: Number,
    default: 0,
    min: 0
  },
  trackingData: {
    speed: {
      type: Number,
      default: 0
    },
    heading: {
      type: Number,
      default: 0
    },
    lastUpdate: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Create geospatial index for location queries
busSchema.index({ currentLocation: '2dsphere' });
busSchema.index({ deviceId: 1 });

export const Bus = mongoose.model<IBus>('Bus', busSchema); 