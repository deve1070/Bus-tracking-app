"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const anonymousPassengerController_1 = require("../controllers/anonymousPassengerController");
const router = express_1.default.Router();
// Public routes (no authentication required)
router.get('/route-buses', anonymousPassengerController_1.getRouteBuses);
router.get('/nearby-stations', anonymousPassengerController_1.getNearbyStations);
router.post('/payment', anonymousPassengerController_1.processPayment);
router.get('/payment-history/:deviceId', anonymousPassengerController_1.getPaymentHistory);
exports.default = router;
