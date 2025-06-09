import { Request, Response } from 'express';
import { Bus, Station, UserRole, User } from '../models';
import { IStation } from '../models/Station';
import mongoose, { Types } from 'mongoose';
import { OSRMService } from '../services/osrmService';
import { IBus } from '../models/Bus';
import { AuthRequest } from '../middleware/auth';

interface StationDocument extends Omit<IStation, '_id'> {
  _id: Types.ObjectId;
}

interface MongoError extends Error {
  code?: number;
  keyPattern?: Record<string, number>;
}

interface StationInRoute {
  stationId: Types.ObjectId;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
}

interface PopulatedBus extends Omit<IBus, 'currentStationId' | 'driverId'> {
  currentStationId?: {
    _id: Types.ObjectId;
    name: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
    address: string;
  };
  driverId?: {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
  };
}

export const createBus = async (req: Request, res: Response) => {
  try {
    const {
      busNumber,
      routeNumber,
      capacity,
      deviceId,
      stationId,
      status,
      schedule
    } = req.body;

    // Validate required fields
    if (!busNumber || !routeNumber || !capacity || !deviceId || !stationId) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if bus number or device ID already exists
    const existingBus = await Bus.findOne({
      $or: [{ busNumber }, { deviceId }]
    });

    if (existingBus) {
      return res.status(400).json({
        message: existingBus.busNumber === busNumber
          ? 'Bus number already exists'
          : 'Device ID already exists'
      });
    }

    // Get the station to use its location
    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(400).json({ message: 'Station not found' });
    }

    // Create new bus with initial location at the station
    const newBus = new Bus({
      busNumber,
      routeNumber,
      capacity,
      deviceId,
      stationId,
      status: status || 'INACTIVE',
      currentLocation: station.location,
      currentStationId: stationId,
      route: {
        stations: [{
          stationId: station._id,
          name: station.name,
          location: station.location
        }],
        estimatedTime: 0
      },
      schedule: schedule || {
        departureTime: new Date(),
        arrivalTime: new Date()
      },
      currentPassengerCount: 0,
      trackingData: {
        speed: 0,
        heading: 0,
        lastUpdate: new Date()
      }
    });

    await newBus.save();

    res.status(201).json({
      message: 'Bus created successfully',
      bus: newBus
    });
  } catch (error) {
    console.error('Error creating bus:', error);
    res.status(500).json({ message: 'Error creating bus' });
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
      (station: any) => station.stationId.toString() === bus.currentStationId?.toString()
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
    if (!req.user?.stationId) {
      return res.status(403).json({ message: 'User is not associated with any station' });
    }

    const buses = await Bus.find({ stationId: req.user.stationId })
      .select('deviceId busNumber routeNumber currentLocation trackingData status lastUpdateTime')
      .lean();

    const busLocations = buses.map(bus => ({
      deviceId: bus.deviceId,
      busNumber: bus.busNumber,
      routeNumber: bus.routeNumber,
      location: {
        lat: bus.currentLocation.coordinates[1],
        lng: bus.currentLocation.coordinates[0]
      },
      speed: bus.trackingData?.speed || 0,
      heading: bus.trackingData?.heading || 0,
      status: bus.status,
      lastUpdate: bus.lastUpdateTime
    }));

    res.json(busLocations);
  } catch (error) {
    console.error('Error fetching bus locations:', error);
    res.status(500).json({ message: 'Error fetching bus locations' });
  }
};

export const getStationBuses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const stationId = req.user?.stationId;

    console.log('User ID:', userId);
    console.log('Station ID:', stationId);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!stationId) {
      return res.status(403).json({ message: 'User is not associated with any station' });
    }

    // Find all buses assigned to the user's station
    const buses = await Bus.find({ stationId })
      .populate('driverId', 'firstName lastName')
      .populate('currentStationId', 'name location address')
      .lean();

    console.log('Found buses:', buses);

    // Transform the data to include current station name
    const transformedBuses = buses.map((bus: any) => {
      const currentStationId = bus.currentStationId?._id?.toString();
      const currentStation = currentStationId ? 
        bus.route.stations.find((station: any) => station.stationId.toString() === currentStationId)
        : null;

      return {
        ...bus,
        currentStationName: currentStation?.name || 'Not at station'
      };
    });

    console.log('Transformed buses:', transformedBuses);

    res.json(transformedBuses);
  } catch (error) {
    console.error('Error fetching station buses:', error);
    res.status(500).json({ message: 'Error fetching station buses' });
  }
};

export const updateBusStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get the user's station
    const user = await User.findById(userId);
    if (!user || !user.stationId) {
      return res.status(403).json({ message: 'User is not associated with any station' });
    }

    // Find the bus and verify it belongs to the user's station
    const bus = await Bus.findById(id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    if (bus.stationId.toString() !== user.stationId.toString()) {
      return res.status(403).json({ message: 'Bus does not belong to your station' });
    }

    // Update the bus status
    bus.status = status;
    await bus.save();

    res.json({ message: 'Bus status updated successfully', bus });
  } catch (error) {
    console.error('Error updating bus status:', error);
    res.status(500).json({ message: 'Error updating bus status' });
  }
}; 