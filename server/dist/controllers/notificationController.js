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
exports.unsubscribeFromTopic = exports.subscribeToTopic = exports.notifyStationPassengers = exports.notifyRoutePassengers = exports.notifyAllDrivers = exports.notifyDriver = void 0;
const firebaseService_1 = require("../services/firebaseService");
const models_1 = require("../models");
// Send notification to a specific driver
const notifyDriver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { driverId, title, body, data } = req.body;
        const driver = yield models_1.User.findOne({ _id: driverId, role: 'Driver' });
        if (!driver || !driver.deviceToken) {
            return res.status(404).json({ error: 'Driver not found or no device token' });
        }
        yield firebaseService_1.FirebaseService.sendToDevice(driver.deviceToken, {
            title,
            body,
            data
        });
        res.json({ message: 'Notification sent successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to send notification' });
    }
});
exports.notifyDriver = notifyDriver;
// Send notification to all drivers
const notifyAllDrivers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, body, data } = req.body;
        const drivers = yield models_1.User.find({ role: 'Driver', deviceToken: { $exists: true } });
        const deviceTokens = drivers.map(driver => driver.deviceToken);
        if (deviceTokens.length === 0) {
            return res.status(404).json({ error: 'No drivers with device tokens found' });
        }
        yield firebaseService_1.FirebaseService.sendToDevices(deviceTokens, {
            title,
            body,
            data
        });
        res.json({ message: 'Notifications sent successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to send notifications' });
    }
});
exports.notifyAllDrivers = notifyAllDrivers;
// Send notification to passengers on a specific route
const notifyRoutePassengers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { routeId, title, body, data } = req.body;
        // Get all buses on this route
        const buses = yield models_1.Bus.find({ routeId });
        if (buses.length === 0) {
            return res.status(404).json({ error: 'No buses found on this route' });
        }
        // Send notification to the route topic
        const topic = `route_${routeId}`;
        yield firebaseService_1.FirebaseService.sendToTopic(topic, {
            title,
            body,
            data
        });
        res.json({ message: 'Notifications sent successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to send notifications' });
    }
});
exports.notifyRoutePassengers = notifyRoutePassengers;
// Send notification to passengers at a specific station
const notifyStationPassengers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stationId, title, body, data } = req.body;
        // Send notification to the station topic
        const topic = `station_${stationId}`;
        yield firebaseService_1.FirebaseService.sendToTopic(topic, {
            title,
            body,
            data
        });
        res.json({ message: 'Notifications sent successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to send notifications' });
    }
});
exports.notifyStationPassengers = notifyStationPassengers;
// Subscribe device to a topic
const subscribeToTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deviceToken, topic } = req.body;
        yield firebaseService_1.FirebaseService.subscribeToTopic(deviceToken, topic);
        res.json({ message: 'Subscribed to topic successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to subscribe to topic' });
    }
});
exports.subscribeToTopic = subscribeToTopic;
// Unsubscribe device from a topic
const unsubscribeFromTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deviceToken, topic } = req.body;
        yield firebaseService_1.FirebaseService.unsubscribeFromTopic(deviceToken, topic);
        res.json({ message: 'Unsubscribed from topic successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to unsubscribe from topic' });
    }
});
exports.unsubscribeFromTopic = unsubscribeFromTopic;
