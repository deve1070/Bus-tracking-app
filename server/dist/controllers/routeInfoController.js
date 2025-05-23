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
exports.getAllRoutesInfo = exports.getRouteBusesInfo = exports.getBusRouteInfo = void 0;
const models_1 = require("../models");
// Get route information for a specific bus
const getBusRouteInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { busId } = req.params;
        const busDoc = yield models_1.Bus.findById(busId)
            .populate('currentStationId', 'name location');
        if (!busDoc) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        const bus = busDoc.toObject();
        const routeInfo = {
            busNumber: bus.busNumber,
            routeNumber: bus.routeNumber,
            currentStation: bus.currentStationId,
            nextStations: bus.route && bus.route.stations ? bus.route.stations : [],
            schedule: bus.schedule,
            status: bus.status,
            currentPassengerCount: bus.currentPassengerCount,
            capacity: bus.capacity,
            estimatedTime: bus.route && bus.route.estimatedTime ? bus.route.estimatedTime : null
        };
        res.json(routeInfo);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch route information' });
    }
});
exports.getBusRouteInfo = getBusRouteInfo;
// Get route information for all buses on a specific route
const getRouteBusesInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { routeNumber } = req.params;
        // Find all buses with the given routeNumber
        const busDocs = yield models_1.Bus.find({ routeNumber })
            .populate('currentStationId', 'name location')
            .select('-__v');
        if (busDocs.length === 0) {
            return res.status(404).json({ error: 'No buses found on this route' });
        }
        const routeInfo = busDocs.map(bd => {
            const bus = bd.toObject();
            return {
                busNumber: bus.busNumber,
                currentStation: bus.currentStationId,
                schedule: bus.schedule,
                status: bus.status,
                currentPassengerCount: bus.currentPassengerCount,
                capacity: bus.capacity,
                estimatedTime: bus.route && bus.route.estimatedTime ? bus.route.estimatedTime : null
            };
        });
        res.json(routeInfo);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch route information' });
    }
});
exports.getRouteBusesInfo = getRouteBusesInfo;
// Get all routes with their buses
const getAllRoutesInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const routes = yield models_1.Route.find()
            .populate('stations', 'name location')
            .select('-__v');
        const routesWithBuses = yield Promise.all(routes.map((routeDoc) => __awaiter(void 0, void 0, void 0, function* () {
            const route = routeDoc.toObject();
            // Find all buses with the same routeNumber as this route
            const busDocs = yield models_1.Bus.find({ routeNumber: route.routeNumber })
                .select('busNumber status currentStationId schedule currentPassengerCount capacity')
                .populate('currentStationId', 'name');
            const buses = busDocs.map(bd => {
                const bus = bd.toObject();
                return {
                    busNumber: bus.busNumber,
                    status: bus.status,
                    currentStation: bus.currentStationId,
                    schedule: bus.schedule,
                    currentPassengerCount: bus.currentPassengerCount,
                    capacity: bus.capacity
                };
            });
            return {
                routeId: route._id,
                routeNumber: route.routeNumber,
                stations: route.stations,
                estimatedDuration: route.estimatedDuration,
                buses: buses
            };
        })));
        res.json(routesWithBuses);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch routes information' });
    }
});
exports.getAllRoutesInfo = getAllRoutesInfo;
