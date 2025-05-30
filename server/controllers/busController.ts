import { Request, Response } from 'express';
import { Bus, Station } from '../models';
import { IStation } from '../models/Station';
import mongoose, { Types } from 'mongoose';
import { OSRMService } from '../services/osrmService';

interface AuthRequest extends Request {
  user?: any;
}

interface StationDocument extends Omit<IStation, '_id'> {
  _id: Types.ObjectId;
}

export const createBus = async (req: AuthRequest, res: Response) => {
  try {
    const {
      busNumber,
      routeNumber,
      capacity,
      route,
      schedule
    } = req.body;

    const bus = new Bus({
      busNumber,
      routeNumber,
      capacity,
      route,
      schedule,
      currentLocation: {
        type: 'Point',
        coordinates: [0, 0] // Default location
      }
    });

    await bus.save();
    res.status(201).json(bus);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create bus' });
  }
};

export const updateBus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const bus = await Bus.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    res.json(bus);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update bus' });
  }
};

export const deleteBus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const bus = await Bus.findByIdAndDelete(id);

    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    res.json({ message: 'Bus deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete bus' });
  }
};

export const getBuses = async (req: AuthRequest, res: Response) => {
  try {
    const { status, routeNumber } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (routeNumber) query.routeNumber = routeNumber;

    const buses = await Bus.find(query)
      .populate('driverId', 'firstName lastName')
      .populate('currentStationId', 'name');

    res.json(buses);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch buses' });
  }
};

export const getBusById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const bus = await Bus.findById(id)
      .populate('driverId', 'firstName lastName')
      .populate('currentStationId', 'name')
      .populate('route.stations', 'name location');

    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    res.json(bus);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch bus' });
  }
};

export const updateBusLocation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { lat, lng, speed, heading } = req.body;

    const bus = await Bus.findById(id);
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    // Get current and next stations
    const currentStationIndex = bus.route?.stations.findIndex(
      (station: Types.ObjectId) => station.toString() === bus.currentStationId?.toString()
    ) ?? -1;
    const nextStationId = currentStationIndex >= 0 ? bus.route?.stations[currentStationIndex + 1] : undefined;

    let trackingData = {
      busId: id,
      location: { lat, lng },
      speed,
      heading,
      status: bus.status,
      currentStation: bus.currentStationId,
      nextStation: null as string | null,
      eta: null as number | null,
      distanceToNext: null as number | null
    };

    if (nextStationId) {
      const nextStationDoc = await Station.findById(nextStationId).lean() as StationDocument | null;
      if (nextStationDoc && nextStationDoc.location) {
        // Calculate ETA and distance using OSRM
        const [eta, distance] = await Promise.all([
          OSRMService.calculateETA(
            { lat, lng },
            {
              lat: nextStationDoc.location.coordinates[1],
              lng: nextStationDoc.location.coordinates[0]
            }
          ),
          OSRMService.calculateDistance(
            { lat, lng },
            {
              lat: nextStationDoc.location.coordinates[1],
              lng: nextStationDoc.location.coordinates[0]
            }
          )
        ]);

        // Update bus with new location and tracking data
        bus.currentLocation = {
          type: 'Point',
          coordinates: [lng, lat]
        };
        bus.lastUpdateTime = new Date();
        if (bus.route) {
        bus.route.estimatedTime = Math.round(eta / 60); // Convert to minutes
        }
        await bus.save();

        // Update tracking data
        trackingData = {
          ...trackingData,
          nextStation: nextStationDoc._id.toString(),
          eta: Math.round(eta / 60),
          distanceToNext: Math.round(distance)
        };
      }
    }

    res.json(trackingData);
  } catch (error) {
    console.error('Error updating bus location:', error);
    res.status(400).json({ error: 'Failed to update bus location' });
  }
};

export const getBusTrackingInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const bus = await Bus.findById(id)
      .populate('currentStationId', 'name location')
      .populate('route.stations', 'name location');

    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    const currentStationIndex = bus.route?.stations.findIndex(
      (station: any) => station._id.toString() === bus.currentStationId?._id.toString()
    ) ?? -1;
    const nextStationId = currentStationIndex >= 0 ? bus.route?.stations[currentStationIndex + 1] : undefined;

    let trackingInfo = {
      busId: bus._id,
      busNumber: bus.busNumber,
      status: bus.status,
      currentLocation: {
        lat: bus.currentLocation.coordinates[1],
        lng: bus.currentLocation.coordinates[0]
      },
      currentStation: bus.currentStationId,
      nextStation: null as string | null,
      eta: null as number | null,
      distanceToNext: null as number | null,
      route: bus.route,
      lastUpdateTime: bus.lastUpdateTime
    };

    if (nextStationId) {
      const nextStationDoc = await Station.findById(nextStationId).lean() as StationDocument | null;
      if (nextStationDoc && nextStationDoc.location) {
      const [eta, distance] = await Promise.all([
        OSRMService.calculateETA(
          {
            lat: bus.currentLocation.coordinates[1],
            lng: bus.currentLocation.coordinates[0]
          },
          {
              lat: nextStationDoc.location.coordinates[1],
              lng: nextStationDoc.location.coordinates[0]
          }
        ),
        OSRMService.calculateDistance(
          {
            lat: bus.currentLocation.coordinates[1],
            lng: bus.currentLocation.coordinates[0]
          },
          {
              lat: nextStationDoc.location.coordinates[1],
              lng: nextStationDoc.location.coordinates[0]
          }
        )
      ]);

      trackingInfo = {
        ...trackingInfo,
          nextStation: nextStationDoc._id.toString(),
        eta: Math.round(eta / 60),
        distanceToNext: Math.round(distance)
      };
      }
    }

    res.json(trackingInfo);
  } catch (error) {
    console.error('Error fetching bus tracking info:', error);
    res.status(400).json({ error: 'Failed to fetch bus tracking info' });
  }
};

export const calculateRoute = async (req: AuthRequest, res: Response) => {
  try {
    const { startStationId, endStationId } = req.params;
    
    const startStation = await Station.findById(startStationId);
    const endStation = await Station.findById(endStationId);

    if (!startStation || !endStation) {
      return res.status(404).json({ error: 'Station not found' });
    }

    const route = await OSRMService.calculateRoute(
      {
        lat: startStation.location.coordinates[1],
        lng: startStation.location.coordinates[0]
      },
      {
        lat: endStation.location.coordinates[1],
        lng: endStation.location.coordinates[0]
      }
    );

    res.json({
      distance: route.routes[0].distance,
      duration: route.routes[0].duration,
      geometry: route.routes[0].geometry
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to calculate route' });
  }
};

export const assignDriver = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    const bus = await Bus.findByIdAndUpdate(
      id,
      { driverId },
      { new: true }
    );

    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    res.json(bus);
  } catch (error) {
    res.status(400).json({ error: 'Failed to assign driver' });
  }
}; 