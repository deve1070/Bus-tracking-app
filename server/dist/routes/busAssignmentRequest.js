"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const busAssignmentRequestController_1 = require("../controllers/busAssignmentRequestController");
const auth_1 = require("../middleware/auth");
const models_1 = require("../models");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.auth);
// Station admin routes
router.post('/', (0, auth_1.checkRole)([models_1.UserRole.STATION_ADMIN]), busAssignmentRequestController_1.createBusAssignmentRequest);
router.get('/station', (0, auth_1.checkRole)([models_1.UserRole.STATION_ADMIN]), busAssignmentRequestController_1.getStationRequests);
// Main admin routes
router.get('/pending', (0, auth_1.checkRole)([models_1.UserRole.MAIN_ADMIN]), busAssignmentRequestController_1.getPendingRequests);
router.put('/:id/respond', (0, auth_1.checkRole)([models_1.UserRole.MAIN_ADMIN]), busAssignmentRequestController_1.respondToRequest);
exports.default = router;
