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
exports.getNearbyStations = exports.assignStationAdmin = exports.getStationById = exports.getStations = exports.deleteStation = exports.updateStation = exports.createStation = void 0;
const models_1 = require("../models");
const createStation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, location, address, description } = req.body;
        const station = new models_1.Station({
            name,
            location,
            address,
            description
        });
        yield station.save();
        res.status(201).json(station);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create station' });
    }
});
exports.createStation = createStation;
const updateStation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const station = yield models_1.Station.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!station) {
            return res.status(404).json({ error: 'Station not found' });
        }
        res.json(station);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update station' });
    }
});
exports.updateStation = updateStation;
const deleteStation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const station = yield models_1.Station.findByIdAndDelete(id);
        if (!station) {
            return res.status(404).json({ error: 'Station not found' });
        }
        res.json({ message: 'Station deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete station' });
    }
});
exports.deleteStation = deleteStation;
const getStations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stations = yield models_1.Station.find()
            .populate('adminId', 'firstName lastName email');
        res.json(stations);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch stations' });
    }
});
exports.getStations = getStations;
const getStationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const station = yield models_1.Station.findById(id)
            .populate('adminId', 'firstName lastName email');
        if (!station) {
            return res.status(404).json({ error: 'Station not found' });
        }
        res.json(station);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch station' });
    }
});
exports.getStationById = getStationById;
const assignStationAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { adminId } = req.body;
        // Verify user exists and is a station admin
        const user = yield models_1.User.findOne({
            _id: adminId,
            role: models_1.UserRole.STATION_ADMIN
        });
        if (!user) {
            return res.status(400).json({ error: 'Invalid station admin' });
        }
        // Update station with new admin
        const station = yield models_1.Station.findByIdAndUpdate(id, { adminId }, { new: true });
        if (!station) {
            return res.status(404).json({ error: 'Station not found' });
        }
        // Update user's station assignment
        yield models_1.User.findByIdAndUpdate(adminId, { stationId: id });
        res.json(station);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to assign station admin' });
    }
});
exports.assignStationAdmin = assignStationAdmin;
const getNearbyStations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lat, lng, maxDistance = 5000 } = req.query; // maxDistance in meters
        const stations = yield models_1.Station.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [Number(lng), Number(lat)]
                    },
                    $maxDistance: Number(maxDistance)
                }
            }
        });
        res.json(stations);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch nearby stations' });
    }
});
exports.getNearbyStations = getNearbyStations;
