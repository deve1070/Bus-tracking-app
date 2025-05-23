import mongoose, { Document, Schema } from 'mongoose';

export interface IAnonymousPassenger extends Document {
  deviceId: string; // Unique identifier for the mobile device
  paymentHistory: mongoose.Types.ObjectId[];
}

const anonymousPassengerSchema = new Schema<IAnonymousPassenger>({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  paymentHistory: [{
    type: Schema.Types.ObjectId,
    ref: 'Payment'
  }]
}, {
  timestamps: true
});

export const AnonymousPassenger = mongoose.model<IAnonymousPassenger>('AnonymousPassenger', anonymousPassengerSchema); 