"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gpsController_1 = require("../controllers/gpsController");
const router = express_1.default.Router();
// Route for GPS trackers to send data
router.post('/update', gpsController_1.receiveGPSData);
// Route to get last known location
router.get('/location/:deviceId', gpsController_1.getLastKnownLocation);
exports.default = router;
