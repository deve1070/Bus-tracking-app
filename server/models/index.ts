// server/models/index.ts
import { Document, Types } from 'mongoose';

// Re-export UserRole from User model
export { UserRole } from './User';

// Re-export models
export * from './User';
export * from './Notification';
export * from './Station';
export * from './Bus';
export * from './Route';
export * from './Feedback';
export * from './Payment';
export * from './AnonymousPassenger';
export * from './BusAssignmentRequest';

// Re-export types
export type { IUser } from './User';
export type { INotification } from './Notification';
export type { IStation } from './Station';
export type { IBus } from './Bus';
export type { IRoute } from './Route';
export type { IFeedback } from './Feedback';
export type { IPayment } from './Payment';
export type { IAnonymousPassenger } from './AnonymousPassenger';
export type { IBusAssignmentRequest } from './BusAssignmentRequest';
