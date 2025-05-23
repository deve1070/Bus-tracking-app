import { Request, Response } from 'express';
import { AnonymousPassenger, Bus, Route, Station } from '../models';
import { Payment } from '../models/Payment';
import { IRoute } from '../models/Route';
import { OSRMService } from '../services/osrmService';

interface AuthRequest extends Request {
  user?: any;
}

// Get active buses for a specific route
export const getRouteBuses = async (req: Request, res: Response) => {
  try {
    const { routeId } = req.query;

    if (!routeId) {
      return res.status(400).json({ error: 'Route ID is required' });
    }

    // Find the route
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // Find all active buses on this route
    const buses = await Bus.find({
      route: routeId,
      status: 'active',
      isAvailable: true
    }).populate('driver', 'firstName lastName phoneNumber')
      .populate<{ route: IRoute }>('route', 'name startStation endStation estimatedDuration');

    res.json({
      message: 'Active buses retrieved successfully',
      buses: buses.map(bus => ({
        id: bus._id,
        number: bus.number,
        location: bus.location,
        driver: bus.driver,
        route: bus.route,
        status: bus.status,
        estimatedArrival: bus.route ? 
          new Date(Date.now() + (bus.route.estimatedDuration || 0) * 60000) : // Convert minutes to milliseconds
          null
      }))
    });
  } catch (error) {
    console.error('Error getting route buses:', error);
    res.status(500).json({ error: 'Failed to get route buses' });
  }
};

// Get nearby stations
export const getNearbyStations = async (req: Request, res: Response) => {
  try {
    const { lat, lng, maxDistance = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const stations = await Station.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng as string), parseFloat(lat as string)]
          },
          $maxDistance: parseInt(maxDistance as string)
        }
      }
    });

    res.json({
      message: 'Nearby stations retrieved successfully',
      stations: stations.map(station => ({
        id: station._id,
        name: station.name
      }))
    });
  } catch (error) {
    console.error('Error getting nearby stations:', error);
    res.status(500).json({ error: 'Failed to get nearby stations' });
  }
};

// Process payment
export const processPayment = async (req: Request, res: Response) => {
  try {
    const { deviceId, routeId, amount, paymentMethod } = req.body;

    if (!deviceId || !routeId || !amount || !paymentMethod) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create or find anonymous passenger
    let passenger = await AnonymousPassenger.findOne({ deviceId });
    if (!passenger) {
      passenger = await AnonymousPassenger.create({ deviceId });
    }

    // Create payment record
    const payment = await Payment.create({
      user: passenger._id,
      amount,
      route: routeId,
      status: 'pending',
      transactionId: `TRX${Date.now()}`,
      method: paymentMethod
    });

    // TODO: Integrate with actual payment gateway
    // For now, we'll just mark it as completed
    payment.status = 'COMPLETED';
    await payment.save();

    res.status(201).json({
      message: 'Payment processed successfully',
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt
      }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

// Get payment history
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;

    const passenger = await AnonymousPassenger.findOne({ deviceId });
    if (!passenger) {
      return res.status(404).json({ error: 'Passenger not found' });
    }

    const payments = await Payment.find({ user: passenger._id })
      .populate('route', 'name startStation endStation');

    res.json({
      message: 'Payment history retrieved successfully',
      payments: payments.map(payment => ({
        id: payment._id,
        amount: payment.amount,
        status: payment.status,
        route: payment.routeId,
        createdAt: payment.createdAt
      }))
    });
  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { deviceId, latitude, longitude } = req.body;

    if (!deviceId || !latitude || !longitude) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Update or create anonymous passenger
    const passenger = await AnonymousPassenger.findOneAndUpdate(
      { deviceId },
      {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        lastUpdateTime: new Date()
      },
      { upsert: true, new: true }
    );

    // Find nearby buses
    const nearbyBuses = await Bus.find({
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: 5000 // 5km radius
        }
      }
    }).populate('route');

    // Get route information for each nearby bus
    const busesWithInfo = await Promise.all(
      nearbyBuses.map(async (bus) => {
        const route = await Route.findById(bus.route.stations[0]);
        return {
          id: bus._id,
          busNumber: bus.busNumber,
          routeNumber: bus.routeNumber,
          currentLocation: bus.currentLocation,
          driverId: bus.driverId,
          status: bus.status,
          route: route ? {
            name: route.name,
            fare: route.fare
          } : null
        };
      })
    );

    res.json({
      message: 'Location updated successfully',
      passenger,
      nearbyBuses: busesWithInfo
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Error updating location' });
  }
}; 