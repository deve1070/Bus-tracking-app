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
exports.OSRMService = void 0;
const axios_1 = __importDefault(require("axios"));
const OSRM_BASE_URL = 'http://router.project-osrm.org/route/v1';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, ms));
    });
}
function retryRequest(requestFn_1) {
    return __awaiter(this, arguments, void 0, function* (requestFn, retries = MAX_RETRIES) {
        var _a, _b, _c;
        try {
            return yield requestFn();
        }
        catch (error) {
            if (retries > 0) {
                console.log(`Request failed, retrying... (${retries} attempts left)`);
                if (error instanceof Error && 'response' in error) {
                    const axiosError = error;
                    console.log('Error details:', {
                        status: (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status,
                        statusText: (_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.statusText,
                        data: (_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.data
                    });
                }
                yield sleep(RETRY_DELAY);
                return retryRequest(requestFn, retries - 1);
            }
            throw error;
        }
    });
}
class OSRMService {
    /**
     * Calculate route between two points
     */
    static calculateRoute(start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                console.log('Calculating route:', { start, end });
                return yield retryRequest(() => __awaiter(this, void 0, void 0, function* () {
                    const response = yield axios_1.default.get(`${OSRM_BASE_URL}/driving/${start.lng},${start.lat};${end.lng},${end.lat}`, {
                        params: {
                            overview: 'full',
                            geometries: 'polyline',
                            steps: true
                        },
                        timeout: 5000 // 5 second timeout
                    });
                    return response.data;
                }));
            }
            catch (error) {
                console.error('Error calculating route:', error instanceof Error ? error.message : error);
                if (error instanceof Error && 'response' in error) {
                    const axiosError = error;
                    console.error('Axios error details:', {
                        status: (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status,
                        statusText: (_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.statusText,
                        data: (_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.data
                    });
                }
                throw new Error('Failed to calculate route');
            }
        });
    }
    /**
     * Calculate distance between two points
     */
    static calculateDistance(start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                console.log('Calculating distance:', { start, end });
                return yield retryRequest(() => __awaiter(this, void 0, void 0, function* () {
                    const response = yield axios_1.default.get(`${OSRM_BASE_URL}/driving/${start.lng},${start.lat};${end.lng},${end.lat}`, {
                        params: {
                            overview: 'false'
                        },
                        timeout: 5000
                    });
                    return response.data.routes[0].distance;
                }));
            }
            catch (error) {
                console.error('Error calculating distance:', error instanceof Error ? error.message : error);
                if (error instanceof Error && 'response' in error) {
                    const axiosError = error;
                    console.error('Axios error details:', {
                        status: (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status,
                        statusText: (_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.statusText,
                        data: (_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.data
                    });
                }
                throw new Error('Failed to calculate distance');
            }
        });
    }
    /**
     * Calculate ETA between two points
     */
    static calculateETA(start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                console.log('Calculating ETA:', { start, end });
                return yield retryRequest(() => __awaiter(this, void 0, void 0, function* () {
                    const response = yield axios_1.default.get(`${OSRM_BASE_URL}/driving/${start.lng},${start.lat};${end.lng},${end.lat}`, {
                        params: {
                            overview: 'false'
                        },
                        timeout: 5000
                    });
                    return response.data.routes[0].duration;
                }));
            }
            catch (error) {
                console.error('Error calculating ETA:', error instanceof Error ? error.message : error);
                if (error instanceof Error && 'response' in error) {
                    const axiosError = error;
                    console.error('Axios error details:', {
                        status: (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status,
                        statusText: (_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.statusText,
                        data: (_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.data
                    });
                }
                throw new Error('Failed to calculate ETA');
            }
        });
    }
    /**
     * Calculate route with multiple waypoints
     */
    static calculateRouteWithWaypoints(waypoints) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                console.log('Calculating route with waypoints:', waypoints);
                return yield retryRequest(() => __awaiter(this, void 0, void 0, function* () {
                    const coordinates = waypoints.map(point => `${point.lng},${point.lat}`).join(';');
                    const response = yield axios_1.default.get(`${OSRM_BASE_URL}/driving/${coordinates}`, {
                        params: {
                            overview: 'full',
                            geometries: 'polyline',
                            steps: true
                        },
                        timeout: 5000
                    });
                    return response.data;
                }));
            }
            catch (error) {
                console.error('Error calculating route with waypoints:', error instanceof Error ? error.message : error);
                if (error instanceof Error && 'response' in error) {
                    const axiosError = error;
                    console.error('Axios error details:', {
                        status: (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status,
                        statusText: (_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.statusText,
                        data: (_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.data
                    });
                }
                throw new Error('Failed to calculate route with waypoints');
            }
        });
    }
}
exports.OSRMService = OSRMService;
