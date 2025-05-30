import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';

export class AnalyticsController {
  // Get analytics data
  static async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const {
        type,
        period,
        startDate,
        endDate,
        routeId,
        busId,
        stationId
      } = req.query;

      if (!type || !period || !startDate || !endDate) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      const analytics = await AnalyticsService.getAnalytics({
        type: type as 'ROUTE' | 'BUS' | 'STATION' | 'PAYMENT' | 'FEEDBACK',
        period: period as 'DAILY' | 'WEEKLY' | 'MONTHLY',
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        routeId: routeId as string,
        busId: busId as string,
        stationId: stationId as string
      });

      res.json(analytics);
    } catch (error) {
      console.error('Error getting analytics:', error);
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  }

  // Trigger daily analytics calculation
  static async calculateDailyAnalytics(req: Request, res: Response): Promise<void> {
    try {
      await AnalyticsService.calculateDailyAnalytics();
      res.json({ message: 'Daily analytics calculated successfully' });
    } catch (error) {
      console.error('Error calculating daily analytics:', error);
      res.status(500).json({ error: 'Failed to calculate daily analytics' });
    }
  }
} 