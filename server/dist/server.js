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
exports.io = void 0;
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const models_1 = require("./models");
const server = http_1.default.createServer(app_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST']
    }
});
exports.io = io;
// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected');
    // Join bus tracking room
    socket.on('join-bus-tracking', (busId) => __awaiter(void 0, void 0, void 0, function* () {
        socket.join(busId);
        console.log(`Client joined bus tracking for bus ID: ${busId}`);
        const bus = yield models_1.Bus.findById(busId).lean();
        if (bus && bus.currentLocation) {
            io.to(busId).emit('bus-location-update', {
                busId,
                location: {
                    lat: bus.currentLocation.coordinates[1],
                    lng: bus.currentLocation.coordinates[0]
                }
            });
        }
    }));
    // Update bus location
    socket.on('update-bus-location', (_a) => __awaiter(void 0, [_a], void 0, function* ({ busId, lat, lng }) {
        const bus = yield models_1.Bus.findByIdAndUpdate(busId, {
            currentLocation: {
                type: 'Point',
                coordinates: [lng, lat]
            },
            lastUpdateTime: new Date()
        }, { new: true }).lean();
        if (bus) {
            io.to(busId).emit('bus-location-update', {
                busId,
                location: { lat, lng }
            });
        }
    }));
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
// Start server
const PORT = parseInt(process.env.PORT || '5000', 10);
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    const tryPort = (port) => __awaiter(void 0, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            server.once('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.log(`Port ${port} is busy, trying ${port + 1}`);
                    resolve(tryPort(port + 1));
                }
                else {
                    reject(err);
                }
            });
            server.listen(port, () => {
                console.log(`Server running on port ${port}`);
                resolve();
            });
        });
    });
    try {
        yield tryPort(PORT);
    }
    catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
});
startServer();
