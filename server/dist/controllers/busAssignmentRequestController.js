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
exports.getStationRequests = exports.respondToRequest = exports.getPendingRequests = exports.createBusAssignmentRequest = void 0;
const models_1 = require("../models");
// Station admin creates a request for bus assignment
const createBusAssignmentRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stationId, routeId, reason, requestedBuses } = req.body;
        const stationAdminId = req.user._id;
        // Verify the station admin is assigned to the station
        const station = yield models_1.Station.findOne({
            _id: stationId,
            adminId: stationAdminId
        });
        if (!station) {
            return res.status(403).json({ error: 'You are not authorized to make requests for this station' });
        }
        const request = new models_1.BusAssignmentRequest({
            stationId,
            routeId,
            requestedBy: stationAdminId,
            reason,
            requestedBuses
        });
        yield request.save();
        res.status(201).json(request);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create bus assignment request' });
    }
});
exports.createBusAssignmentRequest = createBusAssignmentRequest;
// Main admin gets all pending requests
const getPendingRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield models_1.BusAssignmentRequest.find({ status: 'PENDING' })
            .populate('stationId', 'name address')
            .populate('routeId', 'routeNumber')
            .populate('requestedBy', 'firstName lastName email');
        res.json(requests);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch pending requests' });
    }
});
exports.getPendingRequests = getPendingRequests;
// Main admin responds to a request
const respondToRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, approvedBuses, responseNote } = req.body;
        const mainAdminId = req.user._id;
        const request = yield models_1.BusAssignmentRequest.findById(id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }
        if (request.status !== 'PENDING') {
            return res.status(400).json({ error: 'Request has already been processed' });
        }
        request.status = status;
        request.approvedBuses = approvedBuses;
        request.responseNote = responseNote;
        request.respondedBy = mainAdminId;
        yield request.save();
        res.json(request);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to respond to request' });
    }
});
exports.respondToRequest = respondToRequest;
// Station admin gets their station's requests
const getStationRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stationAdminId = req.user._id;
        const station = yield models_1.Station.findOne({ adminId: stationAdminId });
        if (!station) {
            return res.status(404).json({ error: 'No station found for this admin' });
        }
        const requests = yield models_1.BusAssignmentRequest.find({ stationId: station._id })
            .populate('routeId', 'routeNumber')
            .sort({ createdAt: -1 });
        res.json(requests);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch station requests' });
    }
});
exports.getStationRequests = getStationRequests;
