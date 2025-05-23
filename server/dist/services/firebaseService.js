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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin
const serviceAccount = require('../config/firebase-service-account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
class FirebaseService {
    /**
     * Send notification to a specific device
     */
    static sendToDevice(deviceToken, notification) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const message = {
                    notification: {
                        title: notification.title,
                        body: notification.body
                    },
                    data: notification.data || {},
                    token: deviceToken
                };
                const response = yield admin.messaging().send(message);
                return response;
            }
            catch (error) {
                console.error('Error sending notification:', error);
                throw error;
            }
        });
    }
    /**
     * Send notification to multiple devices
     */
    static sendToDevices(deviceTokens, notification) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const message = {
                    notification: {
                        title: notification.title,
                        body: notification.body
                    },
                    data: notification.data || {},
                    tokens: deviceTokens
                };
                const response = yield admin.messaging().sendMulticast(message);
                return response;
            }
            catch (error) {
                console.error('Error sending notifications:', error);
                throw error;
            }
        });
    }
    /**
     * Send notification to a topic
     */
    static sendToTopic(topic, notification) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const message = {
                    notification: {
                        title: notification.title,
                        body: notification.body
                    },
                    data: notification.data || {},
                    topic: topic
                };
                const response = yield admin.messaging().send(message);
                return response;
            }
            catch (error) {
                console.error('Error sending topic notification:', error);
                throw error;
            }
        });
    }
    /**
     * Subscribe device to a topic
     */
    static subscribeToTopic(deviceToken, topic) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield admin.messaging().subscribeToTopic(deviceToken, topic);
                return response;
            }
            catch (error) {
                console.error('Error subscribing to topic:', error);
                throw error;
            }
        });
    }
    /**
     * Unsubscribe device from a topic
     */
    static unsubscribeFromTopic(deviceToken, topic) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield admin.messaging().unsubscribeFromTopic(deviceToken, topic);
                return response;
            }
            catch (error) {
                console.error('Error unsubscribing from topic:', error);
                throw error;
            }
        });
    }
}
exports.FirebaseService = FirebaseService;
