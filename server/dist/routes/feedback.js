"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const feedbackController_1 = require("../controllers/feedbackController");
const auth_1 = require("../middleware/auth");
const models_1 = require("../models");
const router = express_1.default.Router();
// Public routes (no authentication required)
router.post('/', feedbackController_1.createFeedback);
router.get('/:id', feedbackController_1.getFeedbackById);
// Protected routes (require authentication)
router.use(auth_1.auth);
// Routes accessible by main admin and station admin
router.get('/', (0, auth_1.checkRole)([models_1.UserRole.MAIN_ADMIN]), feedbackController_1.getFeedbacks);
router.post('/:id/respond', (0, auth_1.checkRole)([models_1.UserRole.MAIN_ADMIN]), feedbackController_1.respondToFeedback);
router.put('/:id/status', (0, auth_1.checkRole)([models_1.UserRole.MAIN_ADMIN]), feedbackController_1.updateFeedbackStatus);
// Analytics route (main admin only)
router.get('/analytics/overview', (0, auth_1.checkRole)([models_1.UserRole.MAIN_ADMIN]), feedbackController_1.getFeedbackAnalytics);
exports.default = router;
