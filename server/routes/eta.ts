// server/routes/eta.ts
import { Router } from 'express';
import { getETA } from '../controllers/eta';

const router = Router();
router.get('/eta', getETA);

export default router;

// server/controllers/eta.ts
import { Request, Response } from 'express';
import axios from 'axios';

export const getETA = async (req: Request, res: Response) => {
  try {
    const { origin, destination } = req.query as { origin: string; destination: string };
    const response = await axios.get(`http://router.project-osrm.org/route/v1/driving/${origin};${destination}`, {
      params: { overview: 'full', steps: true }
    });
    const duration = response.data.routes[0].duration / 60;
    res.json({ duration, distance: response.data.routes[0].distance / 1000 });
  } catch (error) {
    console.error('ETA error:', error);
    res.status(500).json({ error: 'Failed to calculate ETA' });
  }
};