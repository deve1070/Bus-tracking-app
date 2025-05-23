"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passwordController_1 = require("../controllers/passwordController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.post('/forgot', passwordController_1.forgotPassword);
router.post('/reset', passwordController_1.resetPassword);
// Protected route (requires authentication)
router.post('/change', auth_1.auth, passwordController_1.changePassword);
exports.default = router;
