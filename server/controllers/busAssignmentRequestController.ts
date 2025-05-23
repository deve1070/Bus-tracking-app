import { Request, Response } from 'express';
import { BusAssignmentRequest, Station, User, UserRole } from '../models';

interface AuthRequest extends Request {
  user?: any;
}

// Station admin creates a request for bus assignment
export const createBusAssignmentRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { stationId, routeId, reason, requestedBuses } = req.body;
    const stationAdminId = req.user._id;

    // Verify the station admin is assigned to the station
    const station = await Station.findOne({
      _id: stationId,
      adminId: stationAdminId
    });

    if (!station) {
      return res.status(403).json({ error: 'You are not authorized to make requests for this station' });
    }

    const request = new BusAssignmentRequest({
      stationId,
      routeId,
      requestedBy: stationAdminId,
      reason,
      requestedBuses
    });

    await request.save();
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create bus assignment request' });
  }
};

// Main admin gets all pending requests
export const getPendingRequests = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await BusAssignmentRequest.find({ status: 'PENDING' })
      .populate('stationId', 'name address')
      .populate('routeId', 'routeNumber')
      .populate('requestedBy', 'firstName lastName email');

    res.json(requests);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch pending requests' });
  }
};

// Main admin responds to a request
export const respondToRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, approvedBuses, responseNote } = req.body;
    const mainAdminId = req.user._id;

    const request = await BusAssignmentRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request has already been processed' });
    }

    request.status = status;
    request.approvedBuses = approvedBuses;
    request.responseNote = responseNote;
    request.respondedBy = mainAdminId;

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: 'Failed to respond to request' });
  }
};

// Station admin gets their station's requests
export const getStationRequests = async (req: AuthRequest, res: Response) => {
  try {
    const stationAdminId = req.user._id;
    const station = await Station.findOne({ adminId: stationAdminId });

    if (!station) {
      return res.status(404).json({ error: 'No station found for this admin' });
    }

    const requests = await BusAssignmentRequest.find({ stationId: station._id })
      .populate('routeId', 'routeNumber')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch station requests' });
  }
}; 