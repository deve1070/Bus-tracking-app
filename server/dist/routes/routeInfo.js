"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routeInfoController_1 = require("../controllers/routeInfoController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes (no authentication required)
router.get('/bus/:busId', routeInfoController_1.getBusRouteInfo);
router.get('/route/:routeId', routeInfoController_1.getRouteBusesInfo);
router.get('/all', routeInfoController_1.getAllRoutesInfo);
// All routes require authentication
router.use(auth_1.auth);
exports.default = router;
