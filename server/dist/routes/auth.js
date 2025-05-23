"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../middleware/auth");
const models_1 = require("../models");
const router = express_1.default.Router();
// Public routes (restricted to MainAdmin and StationAdmin)
router.post('/register', (0, auth_2.checkRole)([models_1.UserRole.MAIN_ADMIN]), authController_1.register);
router.post('/login', (0, auth_2.checkRole)([models_1.UserRole.MAIN_ADMIN, models_1.UserRole.STATION_ADMIN]), authController_1.login);
// Protected routes
router.use(auth_1.auth);
router.get('/profile', authController_1.getProfile);
exports.default = router;
