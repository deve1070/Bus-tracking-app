import { Request, Response } from 'express';
import { User, Bus } from '../models';
import { FirebaseService } from '../services/firebaseService';
import NotificationModel, { INotification } from '../models/Notification';
import { AuthRequest } from '../types/express';
import mongoose from 'mongoose';

interface NotificationRequest extends Request {
  user?: {
    _id: string;
    deviceToken?: string;
  };
}

export const sendNotification = async (req: NotificationRequest, res: Response) => {
  try {
    const { recipientId, message, type } = req.body;

    if (!recipientId || !message || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Create notification record
    const notification = new NotificationModel({
      title: 'New Notification',
      message,
      type,
      recipients: [new mongoose.Types.ObjectId(recipientId)],
      status: 'pending',
      read: false
    }) as INotification;

    await notification.save();

    // Send push notification if device token exists
    if (recipient.deviceToken) {
      await FirebaseService.sendToDevice(recipient.deviceToken, {
        title: 'New Notification',
        body: message,
        data: {
          type,
          notificationId: notification.id.toString()
        }
      });
    }

    res.json({
      message: 'Notification sent successfully',
      notification
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Error sending notification' });
  }
};

export const sendBulkNotification = async (req: NotificationRequest, res: Response) => {
  try {
    const { message, type, role } = req.body;

    if (!message || !type || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get all users with the specified role
    const users = await User.find({ role });
    const notifications = [];

    for (const user of users) {
      // Create notification record
      const notification = new NotificationModel({
        title: 'New Notification',
        message,
        type,
        recipients: [new mongoose.Types.ObjectId(user.id.toString())],
        status: 'pending',
        read: false
      }) as INotification;

      await notification.save();
      notifications.push(notification);

      // Send push notification if device token exists
      if (user.deviceToken) {
        await FirebaseService.sendToDevice(user.deviceToken, {
          title: 'New Notification',
          body: message,
          data: {
            type,
            notificationId: notification.id.toString()
          }
        });
      }
    }

    res.json({
      message: 'Bulk notification sent successfully',
      count: notifications.length
    });
  } catch (error) {
    console.error('Error sending bulk notification:', error);
    res.status(500).json({ message: 'Error sending bulk notification' });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await NotificationModel.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { title, message, type, recipients } = req.body;
    const notification = new NotificationModel({
      title,
      message,
      type,
      recipients: recipients.map((id: string) => new mongoose.Types.ObjectId(id)),
      status: 'pending',
      read: false
    });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

export const updateNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, message, type, recipients, status } = req.body;
    const notification = await NotificationModel.findByIdAndUpdate(
      id,
      { 
        title, 
        message, 
        type, 
        recipients: recipients.map((id: string) => new mongoose.Types.ObjectId(id)),
        status 
      },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await NotificationModel.findByIdAndDelete(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

export const markAsRead = async (req: NotificationRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const notification = await NotificationModel.findOne({
      _id: notificationId,
      recipients: new mongoose.Types.ObjectId(userId)
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

// Send notification to a specific driver
export const notifyDriver = async (req: AuthRequest, res: Response) => {
  try {
    const { driverId, title, body, data } = req.body;

    const driver = await User.findOne({ _id: driverId, role: 'Driver' });
    if (!driver || !driver.deviceToken) {
      return res.status(404).json({ error: 'Driver not found or no device token' });
    }

    await FirebaseService.sendToDevice(driver.deviceToken, {
      title,
      body,
      data
    });

    res.json({ message: 'Notification sent successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to send notification' });
  }
};

// Send notification to all drivers
export const notifyAllDrivers = async (req: AuthRequest, res: Response) => {
  try {
    const { title, body, data } = req.body;

    const drivers = await User.find({ role: 'Driver', deviceToken: { $exists: true } });
    const deviceTokens = drivers.map(driver => driver.deviceToken).filter(Boolean) as string[];

    if (deviceTokens.length === 0) {
      return res.status(404).json({ error: 'No drivers with device tokens found' });
    }

    await FirebaseService.sendToDevices(deviceTokens, {
      title,
      body,
      data
    });

    res.json({ message: 'Notifications sent successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to send notifications' });
  }
};

// Send notification to passengers on a specific route
export const notifyRoutePassengers = async (req: AuthRequest, res: Response) => {
  try {
    const { routeId, title, body, data } = req.body;

    // Get all buses on this route
    const buses = await Bus.find({ routeId });
    if (buses.length === 0) {
      return res.status(404).json({ error: 'No buses found on this route' });
    }

    // Send notification to the route topic
    const topic = `route_${routeId}`;
    await FirebaseService.sendToTopic(topic, {
      title,
      body,
      data
    });

    res.json({ message: 'Notifications sent successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to send notifications' });
  }
};

// Send notification to passengers at a specific station
export const notifyStationPassengers = async (req: AuthRequest, res: Response) => {
  try {
    const { stationId, title, body, data } = req.body;

    // Send notification to the station topic
    const topic = `station_${stationId}`;
    await FirebaseService.sendToTopic(topic, {
      title,
      body,
      data
    });

    res.json({ message: 'Notifications sent successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to send notifications' });
  }
};

// Subscribe device to a topic
export const subscribeToTopic = async (req: Request, res: Response) => {
  try {
    const { deviceToken, topic } = req.body;

    await FirebaseService.subscribeToTopic(deviceToken, topic);
    res.json({ message: 'Subscribed to topic successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to subscribe to topic' });
  }
};

// Unsubscribe device from a topic
export const unsubscribeFromTopic = async (req: Request, res: Response) => {
  try {
    const { deviceToken, topic } = req.body;

    await FirebaseService.unsubscribeFromTopic(deviceToken, topic);
    res.json({ message: 'Unsubscribed from topic successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to unsubscribe from topic' });
  }
}; 