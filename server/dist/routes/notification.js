"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const auth_1 = require("../middleware/auth");
const models_1 = require("../models");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.auth);
// Admin routes
router.post('/driver', (0, auth_1.checkRole)([models_1.UserRole.MAIN_ADMIN, models_1.UserRole.STATION_ADMIN]), notificationController_1.notifyDriver);
router.post('/drivers', (0, auth_1.checkRole)([models_1.UserRole.MAIN_ADMIN]), notificationController_1.notifyAllDrivers);
router.post('/route', (0, auth_1.checkRole)([models_1.UserRole.MAIN_ADMIN, models_1.UserRole.STATION_ADMIN]), notificationController_1.notifyRoutePassengers);
router.post('/station', (0, auth_1.checkRole)([models_1.UserRole.MAIN_ADMIN, models_1.UserRole.STATION_ADMIN]), notificationController_1.notifyStationPassengers);
// Public routes (for device token management)
router.post('/subscribe', notificationController_1.subscribeToTopic);
router.post('/unsubscribe', notificationController_1.unsubscribeFromTopic);
exports.default = router;
