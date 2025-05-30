import { Request, Response, RequestHandler } from 'express';
import { Route } from '../models';
import { AuthRequest } from '../middleware/auth';

export const createRoute: RequestHandler = async (req, res) => {
  try {
    const { name, routeNumber, description, stations, totalDistance, estimatedDuration, fare, schedule } = req.body;
    console.log('Creating route with data:', { name, routeNumber, description, stations, totalDistance, estimatedDuration, fare, schedule });

    const route = new Route({
      name,
      routeNumber,
      description,
      stations,
      totalDistance,
      estimatedDuration,
      fare,
      schedule
    });

    await route.save();
    res.status(201).json(route);
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(400).json({ error: 'Failed to create route' });
  }
};

export const getRoutes: RequestHandler = async (req, res) => {
  try {
    const routes = await Route.find().populate('stations');
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
};

export const getRouteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const route = await Route.findById(req.params.id).populate('stations');
    if (!route) {
      res.status(404).json({ error: 'Route not found' });
      return;
    }
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch route' });
  }
};

export const getRouteByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const route = await Route.findOne({ name });

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json(route);
  } catch (error) {
    console.error('Error in getRouteByName:', error);
    res.status(400).json({ error: 'Failed to fetch route' });
  }
};

export const updateRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const route = await Route.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json(route);
  } catch (error) {
    console.error('Error in updateRoute:', error);
    res.status(400).json({ error: 'Failed to update route' });
  }
};

export const deleteRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const route = await Route.findByIdAndDelete(id);

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Error in deleteRoute:', error);
    res.status(400).json({ error: 'Failed to delete route' });
  }
}; 