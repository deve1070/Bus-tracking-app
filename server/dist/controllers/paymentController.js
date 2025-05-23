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
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadReceipt = exports.getPaymentHistory = exports.verifyPayment = exports.initializePayment = exports.estimateFare = void 0;
const paymentService_1 = require("../services/paymentService");
const models_1 = require("../models");
const uuid_1 = require("uuid");
// Estimate fare for a route
const estimateFare = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { routeId } = req.params;
        const route = yield models_1.Route.findById(routeId);
        if (!route) {
            return res.status(404).json({ error: 'Route not found' });
        }
        // Calculate fare based on route distance or fixed price
        const estimatedFare = route.fare || 0;
        res.json({
            routeId,
            estimatedFare,
            currency: 'ETB'
        });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to estimate fare' });
    }
});
exports.estimateFare = estimateFare;
// Initialize payment
const initializePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { routeId, paymentMethod, walletType } = req.body;
        const userId = req.user._id;
        // Validate payment method
        if (!['MOBILE_WALLET', 'QR_CODE'].includes(paymentMethod)) {
            return res.status(400).json({ error: 'Invalid payment method' });
        }
        // Validate wallet type for mobile wallet payments
        if (paymentMethod === 'MOBILE_WALLET' && !['TELEBIRR', 'CBE_BIRR'].includes(walletType)) {
            return res.status(400).json({ error: 'Invalid wallet type' });
        }
        // Get route and calculate fare
        const route = yield models_1.Route.findById(routeId);
        if (!route) {
            return res.status(404).json({ error: 'Route not found' });
        }
        const amount = route.fare || 0;
        const tx_ref = (0, uuid_1.v4)();
        // Create payment record
        const payment = yield models_1.Payment.create({
            userId,
            routeId,
            amount,
            currency: 'ETB',
            paymentMethod,
            transactionReference: tx_ref,
            metadata: {
                walletType: paymentMethod === 'MOBILE_WALLET' ? walletType : undefined
            }
        });
        // Initialize payment with Chapa
        const paymentData = yield paymentService_1.PaymentService.initializePayment({
            amount,
            currency: 'ETB',
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            tx_ref,
            callback_url: `${process.env.API_URL}/api/payments/verify`,
            return_url: `${process.env.FRONTEND_URL}/payment/status`
        });
        // Generate QR code if QR payment method is selected
        let qrCode;
        if (paymentMethod === 'QR_CODE') {
            const qrData = yield paymentService_1.PaymentService.generateQRCode({
                amount,
                currency: 'ETB',
                tx_ref
            });
            qrCode = qrData.data.qr_code;
            // Update payment record with QR code
            payment.metadata.qrCode = qrCode;
            yield payment.save();
        }
        res.json({
            paymentId: payment._id,
            checkoutUrl: paymentData.data.checkout_url,
            qrCode
        });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to initialize payment' });
    }
});
exports.initializePayment = initializePayment;
// Verify payment
const verifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tx_ref } = req.query;
        // Verify payment with Chapa
        const verification = yield paymentService_1.PaymentService.verifyPayment(tx_ref);
        // Update payment record
        const payment = yield models_1.Payment.findOne({ transactionReference: tx_ref });
        if (payment) {
            payment.status = verification.status === 'success' ? 'COMPLETED' : 'FAILED';
            payment.receiptUrl = verification.receipt_url;
            yield payment.save();
        }
        res.json({ status: payment === null || payment === void 0 ? void 0 : payment.status });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to verify payment' });
    }
});
exports.verifyPayment = verifyPayment;
// Get payment history
const getPaymentHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const payments = yield models_1.Payment.find({ userId })
            .populate('routeId', 'routeNumber')
            .sort({ createdAt: -1 });
        res.json(payments);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch payment history' });
    }
});
exports.getPaymentHistory = getPaymentHistory;
// Download receipt
const downloadReceipt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { paymentId } = req.params;
        const userId = req.user._id;
        const payment = yield models_1.Payment.findOne({ _id: paymentId, userId });
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        if (!payment.receiptUrl) {
            return res.status(404).json({ error: 'Receipt not available' });
        }
        res.json({ receiptUrl: payment.receiptUrl });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to get receipt' });
    }
});
exports.downloadReceipt = downloadReceipt;
