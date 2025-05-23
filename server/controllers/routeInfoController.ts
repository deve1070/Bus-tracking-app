import { Request, Response } from 'express';
import { Bus, Route, Station } from '../models';

interface AuthRequest extends Request {
  user?: any;
}

// Get route information for a specific bus
export const getBusRouteInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { busId } = req.params;

    const busDoc = await Bus.findById(busId)
      .populate('currentStationId', 'name location');

    if (!busDoc) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    const bus = busDoc.toObject() as any;
    const routeInfo = {
      busNumber: bus.busNumber,
      routeNumber: bus.routeNumber,
      currentStation: bus.currentStationId,
      nextStations: bus.route && bus.route.stations ? bus.route.stations : [],
      schedule: bus.schedule,
      status: bus.status,
      currentPassengerCount: bus.currentPassengerCount,
      capacity: bus.capacity,
      estimatedTime: bus.route && bus.route.estimatedTime ? bus.route.estimatedTime : null
    };

    res.json(routeInfo);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch route information' });
  }
};

// Get route information for all buses on a specific route
export const getRouteBusesInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { routeNumber } = req.params;

    // Find all buses with the given routeNumber
    const busDocs = await Bus.find({ routeNumber })
      .populate('currentStationId', 'name location')
      .select('-__v');

    if (busDocs.length === 0) {
      return res.status(404).json({ error: 'No buses found on this route' });
    }

    const routeInfo = busDocs.map(bd => {
      const bus = bd.toObject() as any;
      return {
        busNumber: bus.busNumber,
        currentStation: bus.currentStationId,
        schedule: bus.schedule,
        status: bus.status,
        currentPassengerCount: bus.currentPassengerCount,
        capacity: bus.capacity,
        estimatedTime: bus.route && bus.route.estimatedTime ? bus.route.estimatedTime : null
      };
    });

    res.json(routeInfo);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch route information' });
  }
};

// Get all routes with their buses
export const getAllRoutesInfo = async (req: AuthRequest, res: Response) => {
  try {
    const routes = await Route.find()
      .populate('stations', 'name location')
      .select('-__v');

    const routesWithBuses = await Promise.all(
      routes.map(async (routeDoc) => {
        const route = routeDoc.toObject() as any;
        // Find all buses with the same routeNumber as this route
        const busDocs = await Bus.find({ routeNumber: route.routeNumber })
          .select('busNumber status currentStationId schedule currentPassengerCount capacity')
          .populate('currentStationId', 'name');

        const buses = busDocs.map(bd => {
          const bus = bd.toObject() as any;
          return {
            busNumber: bus.busNumber,
            status: bus.status,
            currentStation: bus.currentStationId,
            schedule: bus.schedule,
            currentPassengerCount: bus.currentPassengerCount,
            capacity: bus.capacity
          };
        });

        return {
          routeId: route._id,
          routeNumber: route.routeNumber,
          stations: route.stations,
          estimatedDuration: route.estimatedDuration,
          buses: buses
        };
      })
    );

    res.json(routesWithBuses);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch routes information' });
  }
}; 