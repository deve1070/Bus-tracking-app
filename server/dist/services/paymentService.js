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
exports.PaymentService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
class PaymentService {
    /**
     * Initialize a payment transaction
     */
    static initializePayment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.post(`${this.CHAPA_API_URL}/transaction/initialize`, data, {
                    headers: {
                        Authorization: `Bearer ${this.CHAPA_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                });
                return response.data;
            }
            catch (error) {
                console.error('Error initializing payment:', error);
                throw error;
            }
        });
    }
    /**
     * Verify a payment transaction
     */
    static verifyPayment(tx_ref) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${this.CHAPA_API_URL}/transaction/verify/${tx_ref}`, {
                    headers: {
                        Authorization: `Bearer ${this.CHAPA_API_KEY}`,
                    },
                });
                return response.data;
            }
            catch (error) {
                console.error('Error verifying payment:', error);
                throw error;
            }
        });
    }
    /**
     * Generate QR code for payment
     */
    static generateQRCode(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.post(`${this.CHAPA_API_URL}/qr-code`, data, {
                    headers: {
                        Authorization: `Bearer ${this.CHAPA_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                });
                return response.data;
            }
            catch (error) {
                console.error('Error generating QR code:', error);
                throw error;
            }
        });
    }
}
exports.PaymentService = PaymentService;
PaymentService.CHAPA_API_URL = 'https://api.chapa.co/v1';
PaymentService.CHAPA_API_KEY = config_1.config.chapa.apiKey;
