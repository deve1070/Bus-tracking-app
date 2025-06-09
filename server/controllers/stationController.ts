import { Request, Response } from 'express';
import { Station, User, UserRole, Bus } from '../models';

interface AuthRequest extends Request {
  user?: any;
}

export const createStation = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      location,
      address,
      description
    } = req.body;

    const station = new Station({
      name,
      location,
      address,
      description
    });

    await station.save();
    res.status(201).json(station);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create station' });
  }
};

export const updateStation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const station = await Station.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json(station);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update station' });
  }
};

export const deleteStation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const station = await Station.findByIdAndDelete(id);

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete station' });
  }
};

export const getStations = async (req: AuthRequest, res: Response) => {
  try {
    const stations = await Station.find();
    res.json(stations);
  } catch (error) {
    console.error('Error in getStations:', error);
    res.status(400).json({ error: 'Failed to fetch stations' });
  }
};

export const getStationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const station = await Station.findById(id);

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json(station);
  } catch (error) {
    console.error('Error in getStationById:', error);
    res.status(400).json({ error: 'Failed to fetch station' });
  }
};

export const assignStationAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    // Verify user exists and is a station admin
    const user = await User.findOne({
      _id: adminId,
      role: UserRole.STATION_ADMIN
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid station admin' });
    }

    // Update station with new admin
    const station = await Station.findByIdAndUpdate(
      id,
      { adminId },
      { new: true }
    );

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    // Update user's station assignment
    await User.findByIdAndUpdate(adminId, { stationId: id });

    res.json(station);
  } catch (error) {
    res.status(400).json({ error: 'Failed to assign station admin' });
  }
};

export const getNearbyStations = async (req: AuthRequest, res: Response) => {
  try {
    const { lat, lng, maxDistance = 5000 } = req.query; // maxDistance in meters

    const latitude = Number(lat);
    const longitude = Number(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }

    const stations = await Station.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: Number(maxDistance)
        }
      }
    });

    res.json(stations);
  } catch (error) {
    console.error('Error in getNearbyStations:', error);
    res.status(400).json({ error: 'Failed to fetch nearby stations' });
  }
};

export const getStationByName = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.params;
    const station = await Station.findOne({ name });

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json(station);
  } catch (error) {
    console.error('Error in getStationByName:', error);
    res.status(400).json({ error: 'Failed to fetch station' });
  }
};

export const getStationStats = async (req: AuthRequest, res: Response) => {
  try {
    const stationId = req.user?.stationId;
    if (!stationId) {
      return res.status(403).json({ 
        error: 'Not authorized',
        details: 'User is not associated with any station'
      });
    }

    // Get total buses assigned to this station
    const totalBuses = await Bus.countDocuments({
      stationId: stationId
    });

    // Get active buses
    const activeBuses = await Bus.countDocuments({
      stationId: stationId,
      status: 'ACTIVE'
    });

    // Get current passengers (sum of all buses' current passenger count)
    const buses = await Bus.find({ stationId: stationId });
    const currentPassengers = buses.reduce((sum, bus) => sum + (bus.currentPassengerCount || 0), 0);
    const totalPassengers = currentPassengers; // This could be enhanced with historical data

    // Get next arrival (this is a placeholder - implement actual next arrival logic)
    const nextArrival = '';

    // Get number of alerts (this is a placeholder - implement actual alert logic)
    const alerts = 0;

    res.json({
      totalBuses,
      activeBuses,
      totalPassengers,
      currentPassengers,
      nextArrival,
      alerts
    });
  } catch (error) {
    console.error('Error in getStationStats:', error);
    res.status(500).json({ error: 'Failed to fetch station stats' });
  }
}; 