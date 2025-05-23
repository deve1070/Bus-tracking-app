import { Request, Response, RequestHandler } from 'express';
import { Route } from '../models';
import { AuthRequest } from '../middleware/auth';

export const createRoute: RequestHandler = async (req, res) => {
  try {
    const { name, routeNumber, description, stations, totalDistance, estimatedDuration } = req.body;

    const route = new Route({
      name,
      routeNumber,
      description,
      stations,
      totalDistance,
      estimatedDuration
    });

    await route.save();
    res.status(201).json(route);
  } catch (error) {
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

export const getRouteById: RequestHandler = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id).populate('stations');
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch route' });
  }
}; 