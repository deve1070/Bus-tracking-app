"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = exports.Feedback = exports.Notification = exports.Schedule = exports.Station = exports.Stop = exports.Route = exports.Bus = exports.User = exports.UserRole = void 0;
// server/models/index.ts
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
// Types and Enums
var UserRole;
(function (UserRole) {
    UserRole["MAIN_ADMIN"] = "MainAdmin";
    UserRole["STATION_ADMIN"] = "StationAdmin";
    UserRole["DRIVER"] = "Driver";
    UserRole["PASSENGER"] = "Passenger";
})(UserRole || (exports.UserRole = UserRole = {}));
// User Schema
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    savedRoutes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Route' }],
    station: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Station', default: null },
    lastLogin: { type: Date, default: null }
}, { timestamps: true });
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified('password')) {
            this.password = yield bcrypt_1.default.hash(this.password, 10);
        }
        next();
    });
});
// Add comparePassword method to schema
userSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcrypt_1.default.compare(password, this.password);
    });
};
// Bus Schema
const busSchema = new mongoose_1.Schema({
    busNumber: { type: String, required: true, unique: true, trim: true },
    routeNumber: { type: String, required: true, unique: true, trim: true },
    capacity: { type: Number, required: true },
    route: {
        stations: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Stop' }],
        estimatedTime: { type: Number, default: null }
    },
    schedule: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
    currentLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    currentStationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Station', default: null },
    driverId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', default: null },
    lastUpdateTime: { type: Date, default: null }
}, { timestamps: true });
busSchema.index({ currentLocation: '2dsphere' });
// Route Schema
const routeSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    stops: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Stop' }],
    schedule: { type: String, required: true }
}, { timestamps: true });
// Stop Schema
const stopSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    }
}, { timestamps: true });
stopSchema.index({ location: '2dsphere' });
// Station Schema
const stationSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    admin: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });
stationSchema.index({ location: '2dsphere' });
// Schedule Schema
const scheduleSchema = new mongoose_1.Schema({
    bus: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Bus', required: true },
    route: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Route', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true }
}, { timestamps: true });
// Notification Schema
const notificationSchema = new mongoose_1.Schema({
    recipient: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ['delay', 'routeChange', 'general'], required: true },
    read: { type: Boolean, default: false }
}, { timestamps: true });
notificationSchema.index({ recipient: 1, createdAt: -1 });
// Feedback Schema
const feedbackSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: false },
    deviceId: { type: String, required: false, trim: true },
    email: { type: String, trim: true, default: null },
    name: { type: String, trim: true, default: null },
    text: { type: String, required: true, trim: true },
    category: { type: String, enum: ['complaint', 'suggestion', 'other'], default: 'other' },
    sentiment: { type: String, enum: ['positive', 'negative', 'neutral'], default: 'neutral' },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' }
}, { timestamps: true });
feedbackSchema.index({ status: 1, createdAt: -1 });
// Payment Schema
const paymentSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: false },
    deviceId: { type: String, required: false, trim: true },
    amount: { type: Number, required: true },
    route: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Route', required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    transactionId: { type: String, unique: true, required: true },
    method: { type: String, enum: ['Telebirr', 'CBEBirr', 'other'], required: true }
}, { timestamps: true });
paymentSchema.index({ user: 1, createdAt: -1 });
// Anonymous Passenger Schema
const anonymousPassengerSchema = new mongoose_1.Schema({
// Add any necessary properties for the AnonymousPassenger model
});
// Create and export models
exports.User = (0, mongoose_1.model)('User', userSchema);
exports.Bus = (0, mongoose_1.model)('Bus', busSchema);
exports.Route = (0, mongoose_1.model)('Route', routeSchema);
exports.Stop = (0, mongoose_1.model)('Stop', stopSchema);
exports.Station = (0, mongoose_1.model)('Station', stationSchema);
exports.Schedule = (0, mongoose_1.model)('Schedule', scheduleSchema);
exports.Notification = (0, mongoose_1.model)('Notification', notificationSchema);
exports.Feedback = (0, mongoose_1.model)('Feedback', feedbackSchema);
exports.Payment = (0, mongoose_1.model)('Payment', paymentSchema);
