"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes (no authentication required)
router.get('/estimate/:routeId', paymentController_1.estimateFare);
router.post('/initialize', paymentController_1.initializePayment);
// All routes require authentication
router.use(auth_1.auth);
// Payment verification (public endpoint for Chapa callback)
router.get('/verify', paymentController_1.verifyPayment);
// Payment history
router.get('/history', paymentController_1.getPaymentHistory);
// Download receipt
router.get('/receipt/:paymentId', paymentController_1.downloadReceipt);
exports.default = router;
