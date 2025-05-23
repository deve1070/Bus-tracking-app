"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stationController_1 = require("../controllers/stationController");
const auth_1 = require("../middleware/auth");
const models_1 = require("../models");
const router = express_1.default.Router();
// Route for getting nearby stations (accessible by all users)
router.get('/nearby', stationController_1.getNearbyStations);
// All routes require authentication
router.use(auth_1.auth);
// Routes accessible by main admin
router.post('/', (0, auth_1.checkRole)([models_1.UserRole.MAIN_ADMIN]), stationController_1.createStation);
router.put('/:id', (0, auth_1.checkRole)([models_1.UserRole.MAIN_ADMIN]), stationController_1.updateStation);
router.delete('/:id', (0, auth_1.checkRole)([models_1.UserRole.MAIN_ADMIN]), stationController_1.deleteStation);
// Routes accessible by main admin and station admin
router.get('/', stationController_1.getStations);
router.get('/:id', stationController_1.getStationById);
// Route for assigning station admin (main admin only)
router.post('/:id/assign-admin', (0, auth_1.checkRole)([models_1.UserRole.MAIN_ADMIN]), stationController_1.assignStationAdmin);
exports.default = router;
