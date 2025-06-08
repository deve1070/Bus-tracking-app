import { Request, Response } from 'express';
import { Bus, Station, UserRole } from '../models';
import { IStation } from '../models/Station';
import mongoose, { Types } from 'mongoose';
import { OSRMService } from '../services/osrmService';

interface AuthRequest extends Request {
  user?: any;
}

interface StationDocument extends Omit<IStation, '_id'> {
  _id: Types.ObjectId;
}

interface MongoError extends Error {
  code?: number;
  keyPattern?: Record<string, number>;
}

export const createBus = async (req: Request, res: Response) => {
  try {
    const { currentStationId, ...busData } = req.body;
    
    // Create the bus first
    const bus = new Bus({
      ...busData,
      currentStationId: currentStationId || undefined
    });
    await bus.save();

    // If a station is assigned, update the station's buses array
    if (currentStationId) {
      await Station.findByIdAndUpdate(
        currentStationId,
        { $addToSet: { buses: bus._id } }
      );
    }

    res.status(201).json(bus);
  } catch (error: any) {
    console.error('Error creating bus:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Bus number already exists' });
    } else {
      res.status(500).json({ message: 'Error creating bus', error: error.message });
    }
  }
};

export const updateBus = async (req: Request, res: Response) => {
  try {
    const { currentStationId, ...updateData } = req.body;
    const busId = req.params.id;

    // Get the current bus to check if it was assigned to a station
    const currentBus = await Bus.findById(busId);
    if (!currentBus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // If the bus was previously assigned to a station, remove it from that station
    if (currentBus.currentStationId) {
      await Station.findByIdAndUpdate(
        currentBus.currentStationId,
        { $pull: { buses: busId } }
      );
    }

    // Update the bus with new data
    const updatedBus = await Bus.findByIdAndUpdate(
      busId,
      { 
        ...updateData,
        currentStationId: currentStationId || undefined
      },
      { new: true }
    );

    // If a new station is assigned, add the bus to that station
    if (currentStationId) {
      await Station.findByIdAndUpdate(
        currentStationId,
        { $addToSet: { buses: busId } }
      );
    }

    res.json(updatedBus);
  } catch (error: any) {
    console.error('Error updating bus:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Bus number already exists' });
    } else {
      res.status(500).json({ message: 'Error updating bus', error: error.message });
    }
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
      .populate({
        path: 'currentStationId',
        select: 'name location address'
      });

    res.json(buses);
  } catch (error) {
    console.error('Error fetching buses:', error);
    res.status(400).json({ error: 'Failed to fetch buses' });
  }
};

export const getBusById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const bus = await Bus.findById(id)
      .populate('driverId', 'firstName lastName')
      .populate({
        path: 'currentStationId',
        select: 'name location address'
      })
      .populate('route.stations', 'name location');

    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    res.json(bus);
  } catch (error) {
    console.error('Error fetching bus:', error);
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

export const getBusLocations = async (req: AuthRequest, res: Response) => {
  try {
    const stationId = req.user.stationId;
    if (!stationId) {
      return res.status(403).json({ error: 'Not authorized to access bus locations' });
    }

    // Find all buses assigned to this station
    const buses = await Bus.find({
      'route.stations': stationId,
      status: { $in: ['ACTIVE', 'INACTIVE'] }
    }).select('deviceId currentLocation status trackingData lastUpdateTime busNumber routeNumber');

    const locations = buses.map(bus => ({
      deviceId: bus.deviceId,
      busNumber: bus.busNumber,
      routeNumber: bus.routeNumber,
      location: {
        lat: bus.currentLocation.coordinates[1],
        lng: bus.currentLocation.coordinates[0]
      },
      speed: bus.trackingData?.speed || 0,
      heading: bus.trackingData?.heading || 0,
      status: bus.status.toLowerCase(),
      lastUpdate: bus.lastUpdateTime
    }));

    res.json(locations);
  } catch (error) {
    console.error('Error getting bus locations:', error);
    res.status(500).json({ error: 'Failed to fetch bus locations' });
  }
};

export const getStationBuses = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Getting station buses for user:', {
      userId: req.user?._id,
      role: req.user?.role,
      stationId: req.user?.stationId,
      user: req.user
    });

    if (!req.user) {
      console.log('No user found in request');
      return res.status(401).json({ 
        error: 'Authentication required',
        details: 'No user found in request'
      });
    }

    if (req.user.role !== UserRole.STATION_ADMIN) {
      console.log('User is not a station admin:', req.user.role);
      return res.status(403).json({ 
        error: 'Access denied',
        details: 'Only station admins can access this endpoint'
      });
    }

    const stationId = req.user.stationId;
    if (!stationId) {
      console.log('No stationId found for user');
      return res.status(403).json({ 
        error: 'Not authorized to access station buses',
        details: 'User is not associated with any station'
      });
    }

    console.log('Finding buses for station:', stationId);
    const buses = await Bus.find({
      'route.stations': stationId
    })
    .populate('driverId', 'firstName lastName')
    .populate('currentStationId', 'name')
    .populate('route.stations', 'name location');

    console.log('Found buses:', buses.length);
    res.json(buses);
  } catch (error) {
    console.error('Error getting station buses:', error);
    res.status(400).json({ 
      error: 'Failed to fetch station buses',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 