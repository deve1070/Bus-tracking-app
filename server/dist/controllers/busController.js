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
exports.assignDriver = exports.calculateRoute = exports.getBusTrackingInfo = exports.updateBusLocation = exports.getBusById = exports.getBuses = exports.deleteBus = exports.updateBus = exports.createBus = void 0;
const models_1 = require("../models");
const server_1 = require("../server");
const osrmService_1 = require("../services/osrmService");
const createBus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { busNumber, routeNumber, capacity, route, schedule } = req.body;
        const bus = new models_1.Bus({
            busNumber,
            routeNumber,
            capacity,
            route,
            schedule,
            currentLocation: {
                type: 'Point',
                coordinates: [0, 0] // Default location
            }
        });
        yield bus.save();
        res.status(201).json(bus);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create bus' });
    }
});
exports.createBus = createBus;
const updateBus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const bus = yield models_1.Bus.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        res.json(bus);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update bus' });
    }
});
exports.updateBus = updateBus;
const deleteBus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const bus = yield models_1.Bus.findByIdAndDelete(id);
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        res.json({ message: 'Bus deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete bus' });
    }
});
exports.deleteBus = deleteBus;
const getBuses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, routeNumber } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (routeNumber)
            query.routeNumber = routeNumber;
        const buses = yield models_1.Bus.find(query)
            .populate('driverId', 'firstName lastName')
            .populate('currentStationId', 'name');
        res.json(buses);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch buses' });
    }
});
exports.getBuses = getBuses;
const getBusById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const bus = yield models_1.Bus.findById(id)
            .populate('driverId', 'firstName lastName')
            .populate('currentStationId', 'name')
            .populate('route.stations', 'name location');
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        res.json(bus);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch bus' });
    }
});
exports.getBusById = getBusById;
const updateBusLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const { lat, lng, speed, heading } = req.body;
        const bus = yield models_1.Bus.findById(id);
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        // Get current and next stations
        const currentStationIndex = (_b = (_a = bus.route) === null || _a === void 0 ? void 0 : _a.stations.findIndex((station) => { var _a; return station.toString() === ((_a = bus.currentStationId) === null || _a === void 0 ? void 0 : _a.toString()); })) !== null && _b !== void 0 ? _b : -1;
        const nextStationId = currentStationIndex >= 0 ? (_c = bus.route) === null || _c === void 0 ? void 0 : _c.stations[currentStationIndex + 1] : undefined;
        let trackingData = {
            busId: id,
            location: { lat, lng },
            speed,
            heading,
            status: bus.status,
            currentStation: bus.currentStationId,
            nextStation: null,
            eta: null,
            distanceToNext: null
        };
        if (nextStationId) {
            const nextStationDoc = yield models_1.Station.findById(nextStationId).lean();
            if (nextStationDoc && nextStationDoc.location) {
                // Calculate ETA and distance using OSRM
                const [eta, distance] = yield Promise.all([
                    osrmService_1.OSRMService.calculateETA({ lat, lng }, {
                        lat: nextStationDoc.location.coordinates[1],
                        lng: nextStationDoc.location.coordinates[0]
                    }),
                    osrmService_1.OSRMService.calculateDistance({ lat, lng }, {
                        lat: nextStationDoc.location.coordinates[1],
                        lng: nextStationDoc.location.coordinates[0]
                    })
                ]);
                // Update bus with new location and tracking data
                bus.currentLocation = {
                    type: 'Point',
                    coordinates: [lng, lat]
                };
                bus.lastUpdateTime = new Date();
                if (bus.route) {
                    bus.route.estimatedTime = Math.round(eta / 60); // Convert to minutes
                }
                yield bus.save();
                // Update tracking data
                trackingData = Object.assign(Object.assign({}, trackingData), { nextStation: nextStationDoc._id.toString(), eta: Math.round(eta / 60), distanceToNext: Math.round(distance) });
            }
        }
        // Emit detailed tracking update
        server_1.io.to(id).emit('bus-tracking-update', trackingData);
        res.json(trackingData);
    }
    catch (error) {
        console.error('Error updating bus location:', error);
        res.status(400).json({ error: 'Failed to update bus location' });
    }
});
exports.updateBusLocation = updateBusLocation;
const getBusTrackingInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const bus = yield models_1.Bus.findById(id)
            .populate('currentStationId', 'name location')
            .populate('route.stations', 'name location');
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        const currentStationIndex = (_b = (_a = bus.route) === null || _a === void 0 ? void 0 : _a.stations.findIndex((station) => { var _a; return station._id.toString() === ((_a = bus.currentStationId) === null || _a === void 0 ? void 0 : _a._id.toString()); })) !== null && _b !== void 0 ? _b : -1;
        const nextStationId = currentStationIndex >= 0 ? (_c = bus.route) === null || _c === void 0 ? void 0 : _c.stations[currentStationIndex + 1] : undefined;
        let trackingInfo = {
            busId: bus._id,
            busNumber: bus.busNumber,
            status: bus.status,
            currentLocation: {
                lat: bus.currentLocation.coordinates[1],
                lng: bus.currentLocation.coordinates[0]
            },
            currentStation: bus.currentStationId,
            nextStation: null,
            eta: null,
            distanceToNext: null,
            route: bus.route,
            lastUpdateTime: bus.lastUpdateTime
        };
        if (nextStationId) {
            const nextStationDoc = yield models_1.Station.findById(nextStationId).lean();
            if (nextStationDoc && nextStationDoc.location) {
                const [eta, distance] = yield Promise.all([
                    osrmService_1.OSRMService.calculateETA({
                        lat: bus.currentLocation.coordinates[1],
                        lng: bus.currentLocation.coordinates[0]
                    }, {
                        lat: nextStationDoc.location.coordinates[1],
                        lng: nextStationDoc.location.coordinates[0]
                    }),
                    osrmService_1.OSRMService.calculateDistance({
                        lat: bus.currentLocation.coordinates[1],
                        lng: bus.currentLocation.coordinates[0]
                    }, {
                        lat: nextStationDoc.location.coordinates[1],
                        lng: nextStationDoc.location.coordinates[0]
                    })
                ]);
                trackingInfo = Object.assign(Object.assign({}, trackingInfo), { nextStation: nextStationDoc._id.toString(), eta: Math.round(eta / 60), distanceToNext: Math.round(distance) });
            }
        }
        res.json(trackingInfo);
    }
    catch (error) {
        console.error('Error fetching bus tracking info:', error);
        res.status(400).json({ error: 'Failed to fetch bus tracking info' });
    }
});
exports.getBusTrackingInfo = getBusTrackingInfo;
const calculateRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startStationId, endStationId } = req.params;
        const startStation = yield models_1.Station.findById(startStationId);
        const endStation = yield models_1.Station.findById(endStationId);
        if (!startStation || !endStation) {
            return res.status(404).json({ error: 'Station not found' });
        }
        const route = yield osrmService_1.OSRMService.calculateRoute({
            lat: startStation.location.coordinates[1],
            lng: startStation.location.coordinates[0]
        }, {
            lat: endStation.location.coordinates[1],
            lng: endStation.location.coordinates[0]
        });
        res.json({
            distance: route.routes[0].distance,
            duration: route.routes[0].duration,
            geometry: route.routes[0].geometry
        });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to calculate route' });
    }
});
exports.calculateRoute = calculateRoute;
const assignDriver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { driverId } = req.body;
        const bus = yield models_1.Bus.findByIdAndUpdate(id, { driverId }, { new: true });
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        res.json(bus);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to assign driver' });
    }
});
exports.assignDriver = assignDriver;
