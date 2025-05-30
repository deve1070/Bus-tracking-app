import { Analytics, IAnalytics } from '../models/Analytics';
import { Bus } from '../models/Bus';
import { Route } from '../models/Route';
import { Station } from '../models/Station';
import { Payment } from '../models/Payment';
import { Feedback } from '../models/Feedback';
import { AnonymousPassenger } from '../models/AnonymousPassenger';

export class AnalyticsService {
  // Calculate and store daily analytics
  static async calculateDailyAnalytics(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate route analytics
    const routes = await Route.find();
    for (const route of routes) {
      const routeAnalytics = await this.calculateRouteAnalytics(String(route._id), today);
      await Analytics.create({
        type: 'ROUTE',
        data: {
          routeId: String(route._id),
          timestamp: today,
          metrics: routeAnalytics
        },
        period: 'DAILY'
      });
    }

    // Calculate bus analytics
    const buses = await Bus.find();
    for (const bus of buses) {
      const busAnalytics = await this.calculateBusAnalytics(String(bus._id), today);
      await Analytics.create({
        type: 'BUS',
        data: {
          busId: String(bus._id),
          timestamp: today,
          metrics: busAnalytics
        },
        period: 'DAILY'
      });
    }

    // Calculate station analytics
    const stations = await Station.find();
    for (const station of stations) {
      const stationAnalytics = await this.calculateStationAnalytics(String(station._id), today);
      await Analytics.create({
        type: 'STATION',
        data: {
          stationId: String(station._id),
          timestamp: today,
          metrics: stationAnalytics
        },
        period: 'DAILY'
      });
    }

    // Calculate payment analytics
    const paymentAnalytics = await this.calculatePaymentAnalytics(today);
    await Analytics.create({
      type: 'PAYMENT',
      data: {
        timestamp: today,
        metrics: paymentAnalytics
      },
      period: 'DAILY'
    });

    // Calculate feedback analytics
    const feedbackAnalytics = await this.calculateFeedbackAnalytics(today);
    await Analytics.create({
      type: 'FEEDBACK',
      data: {
        timestamp: today,
        metrics: feedbackAnalytics
      },
      period: 'DAILY'
    });
  }

  private static async calculateRouteAnalytics(routeId: string, date: Date): Promise<any> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const [passengerCount, revenue, averageSpeed] = await Promise.all([
      AnonymousPassenger.countDocuments({ routeId, createdAt: { $gte: date, $lt: nextDay } }),
      Payment.aggregate([
        { $match: { route: routeId, createdAt: { $gte: date, $lt: nextDay } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Bus.aggregate([
        { $match: { route: routeId, lastUpdateTime: { $gte: date, $lt: nextDay } } },
        { $group: { _id: null, avgSpeed: { $avg: '$trackingData.speed' } } }
      ])
    ]);

    return {
      passengerCount,
      revenue: revenue[0]?.total || 0,
      averageSpeed: averageSpeed[0]?.avgSpeed || 0,
      delayTime: 0 // Calculate based on schedule vs actual arrival times
    };
  }

  private static async calculateBusAnalytics(busId: string, date: Date): Promise<any> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const bus = await Bus.findById(busId);
    if (!bus) return {};

    const passengerCount = await AnonymousPassenger.countDocuments({
      busId,
      createdAt: { $gte: date, $lt: nextDay }
    });

    return {
      passengerCount,
      occupancyRate: (passengerCount / bus.capacity) * 100,
      averageSpeed: bus.trackingData?.speed || 0
    };
  }

  private static async calculateStationAnalytics(stationId: string, date: Date): Promise<any> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const passengerCount = await AnonymousPassenger.countDocuments({
      stationId,
      createdAt: { $gte: date, $lt: nextDay }
    });

    return {
      passengerCount
    };
  }

  private static async calculatePaymentAnalytics(date: Date): Promise<any> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const payments = await Payment.find({
      createdAt: { $gte: date, $lt: nextDay }
    });

    const total = payments.length;
    const successful = payments.filter(p => p.status === 'COMPLETED').length;
    const failed = payments.filter(p => p.status === 'FAILED').length;
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    return {
      paymentStats: {
        total,
        successful,
        failed,
        averageAmount: total > 0 ? totalAmount / total : 0
      }
    };
  }

  private static async calculateFeedbackAnalytics(date: Date): Promise<any> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const feedbacks = await Feedback.find({
      createdAt: { $gte: date, $lt: nextDay }
    });

    return {
      feedbackCount: {
        positive: feedbacks.filter(f => f.sentiment === 'POSITIVE').length,
        negative: feedbacks.filter(f => f.sentiment === 'NEGATIVE').length,
        neutral: feedbacks.filter(f => f.sentiment === 'NEUTRAL').length
      }
    };
  }

  // Get analytics data
  static async getAnalytics(params: {
    type: 'ROUTE' | 'BUS' | 'STATION' | 'PAYMENT' | 'FEEDBACK';
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    startDate: Date;
    endDate: Date;
    routeId?: string;
    busId?: string;
    stationId?: string;
  }): Promise<IAnalytics[]> {
    const query: any = {
      type: params.type,
      period: params.period,
      'data.timestamp': {
        $gte: params.startDate,
        $lte: params.endDate
      }
    };

    if (params.routeId) query['data.routeId'] = params.routeId;
    if (params.busId) query['data.busId'] = params.busId;
    if (params.stationId) query['data.stationId'] = params.stationId;

    return Analytics.find(query).sort({ 'data.timestamp': 1 });
  }
} 