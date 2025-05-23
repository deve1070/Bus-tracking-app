"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const busController_1 = require("../controllers/busController");
const auth_1 = require("../middleware/auth");
const models_1 = require("../models");
const router = express_1.default.Router();
// Route for calculating routes between stations (accessible by all users)
router.get('/route/:startStationId/:endStationId', busController_1.calculateRoute);
// Route for getting detailed bus tracking information (accessible by all authenticated users)
router.get('/:id/tracking', busController_1.getBusTrackingInfo);
// All routes require authentication
router.use(auth_1.auth);
// Routes accessible by main admin and station admin
router.post('/', (0, auth_1.checkRole)([models_1.UserRole.MAIN_ADMIN]), busController_1.createBus);
router.put('/:id', (0, auth_1.checkRole)([models_1.UserRole.MAIN_ADMIN]), busController_1.updateBus);
router.delete('/:id', (0, auth_1.checkRole)([models_1.UserRole.MAIN_ADMIN]), busController_1.deleteBus);
router.get('/', busController_1.getBuses);
router.get('/:id', busController_1.getBusById);
// Routes for bus location updates (accessible by drivers)
router.post('/:id/location', (0, auth_1.checkRole)([models_1.UserRole.DRIVER]), busController_1.updateBusLocation);
// Route for assigning drivers (main admin only)
router.post('/:id/assign-driver', (0, auth_1.checkRole)([models_1.UserRole.MAIN_ADMIN]), busController_1.assignDriver);
exports.default = router;
