import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  routeId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentMethod: 'MOBILE_WALLET' | 'QR_CODE';
  transactionReference: string;
  receiptUrl?: string;
  metadata: {
    walletType?: string;
    qrCode?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  deviceId: string;
}

const paymentSchema = new Schema<IPayment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  routeId: {
    type: Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'ETB'
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  paymentMethod: {
    type: String,
    enum: ['MOBILE_WALLET', 'QR_CODE'],
    required: true
  },
  transactionReference: {
    type: String,
    required: true,
    unique: true
  },
  receiptUrl: {
    type: String
  },
  metadata: {
    walletType: String,
    qrCode: String
  },
  deviceId: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ transactionReference: 1 }, { unique: true });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema); 