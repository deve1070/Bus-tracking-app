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
exports.getLastKnownLocation = exports.receiveGPSData = void 0;
const gpsService_1 = require("../services/gpsService");
const server_1 = require("../server");
const receiveGPSData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deviceId, latitude, longitude, speed, heading, timestamp } = req.body;
        // Process GPS data
        yield gpsService_1.GPSService.processGPSData({
            deviceId,
            latitude,
            longitude,
            speed,
            heading,
            timestamp: new Date(timestamp)
        });
        // Emit real-time update
        server_1.io.to(deviceId).emit('gps-update', {
            deviceId,
            location: {
                lat: latitude,
                lng: longitude
            },
            speed,
            heading,
            timestamp: new Date(timestamp)
        });
        res.status(200).json({ message: 'GPS data received successfully' });
    }
    catch (error) {
        console.error('Error receiving GPS data:', error);
        res.status(400).json({ error: 'Failed to process GPS data' });
    }
});
exports.receiveGPSData = receiveGPSData;
const getLastKnownLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deviceId } = req.params;
        const location = yield gpsService_1.GPSService.getLastKnownLocation(deviceId);
        res.json(location);
    }
    catch (error) {
        console.error('Error getting last known location:', error);
        res.status(400).json({ error: 'Failed to get last known location' });
    }
});
exports.getLastKnownLocation = getLastKnownLocation;
