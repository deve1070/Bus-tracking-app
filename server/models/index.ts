// server/models/index.ts
import { Document, Types } from 'mongoose';

// Types and Enums
export enum UserRole {
  MAIN_ADMIN = 'MainAdmin',
  STATION_ADMIN = 'StationAdmin',
  DRIVER = 'Driver'
}

export type UserRoleType = keyof typeof UserRole;

// Re-export all models
export { User } from './User';
export { Bus } from './Bus';
export { Route } from './Route';
export { Station } from './Station';
export { Feedback } from './Feedback';
export { Payment } from './Payment';
export { AnonymousPassenger } from './AnonymousPassenger';
export { BusAssignmentRequest } from './BusAssignmentRequest';

// Re-export types
export type { IUser } from './User';
export type { IBus } from './Bus';
export type { IRoute } from './Route';
export type { IStation } from './Station';
export type { IFeedback } from './Feedback';
export type { IPayment } from './Payment';
export type { IAnonymousPassenger } from './AnonymousPassenger';
export type { IBusAssignmentRequest } from './BusAssignmentRequest';
