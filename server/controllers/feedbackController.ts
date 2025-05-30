import { Request, Response } from 'express';
import { Feedback, User } from '../models';
import natural from 'natural';

interface AuthRequest extends Request {
  user?: any;
}

const tokenizer = new natural.WordTokenizer();
const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');

export const createFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const {
      type,
      category,
      message,
      relatedBusId,
      relatedStationId
    } = req.body;

    // Perform sentiment analysis
    const tokens = tokenizer.tokenize(message);
    const sentiment = analyzer.getSentiment(tokens);
    const sentimentCategory = sentiment > 0 ? 'POSITIVE' : sentiment < 0 ? 'NEGATIVE' : 'NEUTRAL';

    const feedback = new Feedback({
      userId: req.user?._id,
      type,
      category,
      message,
      sentiment: sentimentCategory,
      relatedBusId,
      relatedStationId
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(400).json({ error: 'Failed to create feedback' });
  }
};

export const getFeedbacks = async (req: AuthRequest, res: Response) => {
  try {
    const { type, status, sentiment } = req.query;
    const query: any = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (sentiment) query.sentiment = sentiment;

    const feedbacks = await Feedback.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('relatedBusId', 'busNumber routeNumber')
      .populate('relatedStationId', 'name')
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch feedbacks' });
  }
};

export const getFeedbackById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('relatedBusId', 'busNumber routeNumber')
      .populate('relatedStationId', 'name')
      .populate('respondedBy', 'firstName lastName');

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch feedback' });
  }
};

export const respondToFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      {
        response,
        respondedBy: req.user._id,
        respondedAt: new Date(),
        status: 'RESOLVED'
      },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    res.status(400).json({ error: 'Failed to respond to feedback' });
  }
};

export const updateFeedbackStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update feedback status' });
  }
};

export const getFeedbackAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const analytics = await Feedback.aggregate([
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

    const categoryAnalytics = await Feedback.aggregate([
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
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch feedback analytics' });
  }
}; 