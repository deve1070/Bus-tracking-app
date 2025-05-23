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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GPSService = void 0;
const models_1 = require("../models");
class GPSService {
    /**
     * Validate GPS coordinates
     */
    static validateCoordinates(latitude, longitude) {
        return (latitude >= -90 && latitude <= 90 &&
            longitude >= -180 && longitude <= 180);
    }
    /**
     * Process GPS data from tracker
     */
    static processGPSData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate coordinates
                if (!this.validateCoordinates(data.latitude, data.longitude)) {
                    throw new Error('Invalid GPS coordinates');
                }
                // Find bus by device ID
                const bus = yield models_1.Bus.findOne({ deviceId: data.deviceId });
                if (!bus) {
                    throw new Error('Bus not found for device ID');
                }
                // Update bus location and status
                bus.currentLocation = {
                    type: 'Point',
                    coordinates: [data.longitude, data.latitude]
                };
                bus.lastUpdateTime = data.timestamp;
                bus.status = data.speed > 0 ? 'ACTIVE' : 'INACTIVE';
                // Update tracking data
                bus.trackingData = {
                    speed: data.speed,
                    heading: data.heading,
                    lastUpdate: data.timestamp
                };
                yield bus.save();
            }
            catch (error) {
                console.error('Error processing GPS data:', error);
                throw error;
            }
        });
    }
    /**
     * Get last known location of a bus
     */
    static getLastKnownLocation(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const bus = yield models_1.Bus.findOne({ deviceId });
                if (!bus) {
                    throw new Error('Bus not found');
                }
                return {
                    deviceId,
                    latitude: bus.currentLocation.coordinates[1],
                    longitude: bus.currentLocation.coordinates[0],
                    speed: ((_a = bus.trackingData) === null || _a === void 0 ? void 0 : _a.speed) || 0,
                    heading: ((_b = bus.trackingData) === null || _b === void 0 ? void 0 : _b.heading) || 0,
                    lastUpdate: bus.lastUpdateTime
                };
            }
            catch (error) {
                console.error('Error getting last known location:', error);
                throw error;
            }
        });
    }
}
exports.GPSService = GPSService;
