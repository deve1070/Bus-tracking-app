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
exports.getPaymentHistory = exports.processPayment = exports.getNearbyStations = exports.getRouteBuses = void 0;
const models_1 = require("../models");
const Payment_1 = require("../models/Payment");
// Get active buses for a specific route
const getRouteBuses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { routeId } = req.query;
        if (!routeId) {
            return res.status(400).json({ error: 'Route ID is required' });
        }
        // Find the route
        const route = yield models_1.Route.findById(routeId);
        if (!route) {
            return res.status(404).json({ error: 'Route not found' });
        }
        // Find all active buses on this route
        const buses = yield models_1.Bus.find({
            route: routeId,
            status: 'active',
            isAvailable: true
        }).populate('driver', 'firstName lastName phoneNumber')
            .populate('route', 'name startStation endStation estimatedDuration');
        res.json({
            message: 'Active buses retrieved successfully',
            buses: buses.map(bus => ({
                id: bus._id,
                number: bus.number,
                location: bus.location,
                driver: bus.driver,
                route: bus.route,
                status: bus.status,
                estimatedArrival: bus.route ?
                    new Date(Date.now() + (bus.route.estimatedDuration || 0) * 60000) : // Convert minutes to milliseconds
                    null
            }))
        });
    }
    catch (error) {
        console.error('Error getting route buses:', error);
        res.status(500).json({ error: 'Failed to get route buses' });
    }
});
exports.getRouteBuses = getRouteBuses;
// Get nearby stations
const getNearbyStations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lat, lng, maxDistance = 5000 } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }
        const stations = yield models_1.Station.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        });
        res.json({
            message: 'Nearby stations retrieved successfully',
            stations: stations.map(station => ({
                id: station._id,
                name: station.name
            }))
        });
    }
    catch (error) {
        console.error('Error getting nearby stations:', error);
        res.status(500).json({ error: 'Failed to get nearby stations' });
    }
});
exports.getNearbyStations = getNearbyStations;
// Process payment
const processPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deviceId, routeId, amount, paymentMethod } = req.body;
        if (!deviceId || !routeId || !amount || !paymentMethod) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        // Create or find anonymous passenger
        let passenger = yield models_1.AnonymousPassenger.findOne({ deviceId });
        if (!passenger) {
            passenger = yield models_1.AnonymousPassenger.create({ deviceId });
        }
        // Create payment record
        const payment = yield Payment_1.Payment.create({
            user: passenger._id,
            amount,
            route: routeId,
            status: 'pending',
            transactionId: `TRX${Date.now()}`,
            method: paymentMethod
        });
        // TODO: Integrate with actual payment gateway
        // For now, we'll just mark it as completed
        payment.status = 'COMPLETED';
        yield payment.save();
        res.status(201).json({
            message: 'Payment processed successfully',
            payment: {
                id: payment._id,
                amount: payment.amount,
                status: payment.status,
                createdAt: payment.createdAt
            }
        });
    }
    catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ error: 'Failed to process payment' });
    }
});
exports.processPayment = processPayment;
// Get payment history
const getPaymentHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deviceId } = req.params;
        const passenger = yield models_1.AnonymousPassenger.findOne({ deviceId });
        if (!passenger) {
            return res.status(404).json({ error: 'Passenger not found' });
        }
        const payments = yield Payment_1.Payment.find({ user: passenger._id })
            .populate('route', 'name startStation endStation');
        res.json({
            message: 'Payment history retrieved successfully',
            payments: payments.map(payment => ({
                id: payment._id,
                amount: payment.amount,
                status: payment.status,
                route: payment.routeId,
                createdAt: payment.createdAt
            }))
        });
    }
    catch (error) {
        console.error('Error getting payment history:', error);
        res.status(500).json({ error: 'Failed to get payment history' });
    }
});
exports.getPaymentHistory = getPaymentHistory;
