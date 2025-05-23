"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const busSchema = new mongoose_1.Schema({
    busNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    routeNumber: {
        type: String,
        required: true,
        trim: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 0
    },
    deviceId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
        default: 'INACTIVE'
    },
    driverId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    currentStationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Station'
    },
    route: {
        stations: [{
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Station'
            }],
        estimatedTime: {
            type: Number,
            required: true
        }
    },
    schedule: {
        departureTime: {
            type: String,
            required: true
        },
        arrivalTime: {
            type: String,
            required: true
        }
    },
    lastUpdateTime: {
        type: Date,
        default: Date.now
    },
    isOnRoute: {
        type: Boolean,
        default: false
    },
    currentPassengerCount: {
        type: Number,
        default: 0,
        min: 0
    },
    trackingData: {
        speed: {
            type: Number,
            default: 0
        },
        heading: {
            type: Number,
            default: 0
        },
        lastUpdate: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true
});
// Create geospatial index for location queries
busSchema.index({ currentLocation: '2dsphere' });
busSchema.index({ deviceId: 1 });
exports.Bus = mongoose_1.default.model('Bus', busSchema);
