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
exports.getFeedbackAnalytics = exports.updateFeedbackStatus = exports.respondToFeedback = exports.getFeedbackById = exports.getFeedbacks = exports.createFeedback = void 0;
const models_1 = require("../models");
const natural_1 = __importDefault(require("natural"));
const tokenizer = new natural_1.default.WordTokenizer();
const analyzer = new natural_1.default.SentimentAnalyzer('English', natural_1.default.PorterStemmer, 'afinn');
const createFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, category, message, relatedBusId, relatedStationId } = req.body;
        // Perform sentiment analysis
        const tokens = tokenizer.tokenize(message);
        const sentiment = analyzer.getSentiment(tokens);
        const sentimentCategory = sentiment > 0 ? 'POSITIVE' : sentiment < 0 ? 'NEGATIVE' : 'NEUTRAL';
        const feedback = new models_1.Feedback({
            userId: req.user._id,
            type,
            category,
            message,
            sentiment: sentimentCategory,
            relatedBusId,
            relatedStationId
        });
        yield feedback.save();
        res.status(201).json(feedback);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create feedback' });
    }
});
exports.createFeedback = createFeedback;
const getFeedbacks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, status, sentiment } = req.query;
        const query = {};
        if (type)
            query.type = type;
        if (status)
            query.status = status;
        if (sentiment)
            query.sentiment = sentiment;
        const feedbacks = yield models_1.Feedback.find(query)
            .populate('userId', 'firstName lastName email')
            .populate('relatedBusId', 'busNumber routeNumber')
            .populate('relatedStationId', 'name')
            .sort({ createdAt: -1 });
        res.json(feedbacks);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch feedbacks' });
    }
});
exports.getFeedbacks = getFeedbacks;
const getFeedbackById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const feedback = yield models_1.Feedback.findById(id)
            .populate('userId', 'firstName lastName email')
            .populate('relatedBusId', 'busNumber routeNumber')
            .populate('relatedStationId', 'name')
            .populate('respondedBy', 'firstName lastName');
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        res.json(feedback);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch feedback' });
    }
});
exports.getFeedbackById = getFeedbackById;
const respondToFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { response } = req.body;
        const feedback = yield models_1.Feedback.findByIdAndUpdate(id, {
            response,
            respondedBy: req.user._id,
            respondedAt: new Date(),
            status: 'RESOLVED'
        }, { new: true });
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        res.json(feedback);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to respond to feedback' });
    }
});
exports.respondToFeedback = respondToFeedback;
const updateFeedbackStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const feedback = yield models_1.Feedback.findByIdAndUpdate(id, { status }, { new: true });
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        res.json(feedback);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update feedback status' });
    }
});
exports.updateFeedbackStatus = updateFeedbackStatus;
const getFeedbackAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const analytics = yield models_1.Feedback.aggregate([
            {
                $group: {
                    _id: {
                        type: '$type',
                        sentiment: '$sentiment',
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            }
        ]);
        const categoryAnalytics = yield models_1.Feedback.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgSentiment: {
                        $avg: {
                            $cond: [
                                { $eq: ['$sentiment', 'POSITIVE'] },
                                1,
                                { $cond: [{ $eq: ['$sentiment', 'NEGATIVE'] }, -1, 0] }
                            ]
                        }
                    }
                }
            }
        ]);
        res.json({
            overall: analytics,
            byCategory: categoryAnalytics
        });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch feedback analytics' });
    }
});
exports.getFeedbackAnalytics = getFeedbackAnalytics;
