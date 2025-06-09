import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBus extends Document {
  busNumber: string;
  routeNumber: string;
  capacity: number;
  deviceId: string; // GPS tracker device ID
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  driverId?: Types.ObjectId;
  currentStationId?: Types.ObjectId;
  stationId: Types.ObjectId;
  currentLocation: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  route: {
    stations: Array<{
      stationId: Types.ObjectId;
      name: string;
      location: {
        type: string;
        coordinates: [number, number];
      };
    }>;
    estimatedTime: number; // in minutes
  };
  schedule: {
    departureTime: Date;
    arrivalTime: Date;
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
  stationId: {
    type: Schema.Types.ObjectId,
    ref: 'Station',
    required: true
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
  route: {
    stations: [{
      stationId: {
        type: Schema.Types.ObjectId,
        ref: 'Station',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number],
          required: true
        }
      }
    }],
    estimatedTime: {
      type: Number,
      required: true
    }
  },
  schedule: {
    departureTime: {
      type: Date,
      required: true
    },
    arrivalTime: {
      type: Date,
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
busSchema.index({ 'route.stations.location': '2dsphere' });

// Create indexes
busSchema.index({ busNumber: 1 });
busSchema.index({ deviceId: 1 });
busSchema.index({ currentLocation: '2dsphere' });

export const Bus = mongoose.model<IBus>('Bus', busSchema); 