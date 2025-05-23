import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  deviceId: string;
  type: 'COMPLAINT' | 'SUGGESTION' | 'PRAISE';
  category: string;
  message: string;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  relatedBusId?: mongoose.Types.ObjectId;
  relatedStationId?: mongoose.Types.ObjectId;
}

const feedbackSchema = new Schema<IFeedback>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  deviceId: {
    type: String,
    required: false,
    trim: true
  },
  type: {
    type: String,
    enum: ['COMPLAINT', 'SUGGESTION', 'PRAISE'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  sentiment: {
    type: String,
    enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE']
  },
  relatedBusId: {
    type: Schema.Types.ObjectId,
    ref: 'Bus'
  },
  relatedStationId: {
    type: Schema.Types.ObjectId,
    ref: 'Station'
  }
}, {
  timestamps: true
});

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema); 