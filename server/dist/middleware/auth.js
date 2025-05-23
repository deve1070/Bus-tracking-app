"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkStationAccess = exports.checkRole = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            throw new Error();
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = yield models_1.User.findOne({ _id: decoded._id, isActive: true });
        if (!user) {
            throw new Error();
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Please authenticate.' });
    }
});
exports.auth = auth;
const checkRole = (roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }
            if (!roles.includes(req.user.role)) {
                throw new Error('Insufficient permissions');
            }
            next();
        }
        catch (error) {
            res.status(403).json({ error: 'Access denied.' });
        }
    });
};
exports.checkRole = checkRole;
const checkStationAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            throw new Error('User not authenticated');
        }
        if (req.user.role === models_1.UserRole.MAIN_ADMIN) {
            return next();
        }
        if (req.user.role === models_1.UserRole.STATION_ADMIN && req.user.stationId) {
            const stationId = req.params.stationId || req.body.stationId;
            if (stationId && stationId.toString() === req.user.stationId.toString()) {
                return next();
            }
        }
        throw new Error('Insufficient station access');
    }
    catch (error) {
        res.status(403).json({ error: 'Access denied to station.' });
    }
});
exports.checkStationAccess = checkStationAccess;
