import { Request, Response } from 'express';
import { User, Bus } from '../models';
import { FirebaseService } from '../services/firebaseService';
import mongoose from 'mongoose';
import admin from 'firebase-admin';
import { Types } from 'mongoose';
import { Notification, UserRole, IUser } from '../models';

interface NotificationRequest extends Request {
  user?: {
    _id: string;
    deviceToken?: string;
  };
}

interface AuthRequest extends Request {
  user?: IUser;
}

interface FirebaseNotification {
  title: string;
  body: string;
}

interface FirebaseData {
  type: string;
  notificationId: string;
}

interface FirebaseMessage {
  notification: FirebaseNotification;
  data: FirebaseData;
  tokens?: string[];
  token?: string;
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
    const notification = new Notification({
      title: 'New Notification',
      message,
      type,
      recipients: [new mongoose.Types.ObjectId(recipientId)],
      status: 'pending',
      read: false
    });

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
      const notification = new Notification({
        title: 'New Notification',
        message,
        type,
        recipients: [new mongoose.Types.ObjectId(user.id.toString())],
        status: 'pending',
        read: false
      });

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

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let query: any = {};

    // If user is a driver, get notifications sent to them
    if (user.role === UserRole.DRIVER) {
      query = {
        $or: [
          { recipient: userId },
          { recipient: 'all' }
        ]
      };
    }
    // If user is a station admin, get notifications they sent
    else if (user.role === UserRole.STATION_ADMIN) {
      query = { sender: userId };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .populate('sender', 'firstName lastName')
      .populate('recipient', 'firstName lastName');

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { title, message, type, recipients } = req.body;
    const notification = new Notification({
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
    const notification = await Notification.findByIdAndUpdate(
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
    const notification = await Notification.findByIdAndDelete(id);
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

    const notification = await Notification.findOne({
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

// Send notification to all users
export const sendNotificationToAll = async (req: AuthRequest, res: Response) => {
  try {
    const { title, message } = req.body;
    const senderId = req.user?._id;

    if (!senderId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if sender is a station admin
    const sender = await User.findById(senderId);
    if (!sender || sender.role !== UserRole.STATION_ADMIN) {
      return res.status(403).json({ message: 'Only station admins can send notifications' });
    }

    // Get all users with device tokens
    const users = await User.find({ deviceToken: { $exists: true, $ne: null } });
    
    // Create notification in database
    const notification = new Notification({
      title,
      message,
      sender: senderId,
      recipient: 'all',
      type: 'broadcast'
    });
    await notification.save();

    // Send to all users with device tokens
    const tokens = users.map(user => user.deviceToken).filter((token): token is string => !!token);
    
    if (tokens.length > 0) {
      for (const token of tokens) {
        const singleMessage = {
          token,
          notification: {
            title,
            body: message
          },
          data: {
            type: 'broadcast',
            notificationId: notification._id?.toString?.() ?? ''
          }
        };
        try {
          await admin.messaging().send(singleMessage);
        } catch (error) {
          console.error('Error sending notification to token:', token, error);
        }
      }
    }

    res.status(200).json({ 
      message: 'Notification sent successfully',
      notification
    });
  } catch (error) {
    console.error('Error in sendNotificationToAll:', error);
    res.status(500).json({ message: 'Error sending notification' });
  }
};

// Send notification to specific driver
export const sendNotificationToDriver = async (req: AuthRequest, res: Response) => {
  try {
    const { driverId, title, message } = req.body;
    const senderId = req.user?._id;

    if (!senderId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if sender is a station admin
    const sender = await User.findById(senderId);
    if (!sender || sender.role !== UserRole.STATION_ADMIN) {
      return res.status(403).json({ message: 'Only station admins can send notifications' });
    }

    // Verify the driver exists and belongs to the station
    const driver = await User.findOne({
      _id: driverId,
      role: UserRole.DRIVER,
      stationId: sender.stationId
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found or not associated with your station' });
    }

    // Create notification in database
    const notification = new Notification({
      title,
      message,
      sender: senderId,
      recipient: driverId,
      type: 'driver'
    });
    await notification.save();

    // Send to driver if they have a device token
    if (driver.deviceToken) {
      const singleMessage = {
        token: driver.deviceToken,
        notification: {
          title,
          body: message
        },
        data: {
          type: 'driver',
          notificationId: notification._id?.toString?.() ?? ''
        }
      };

      try {
        await admin.messaging().send(singleMessage);
      } catch (error) {
        console.error('Error sending notification to driver:', error);
      }
    }

    res.status(200).json({ 
      message: 'Notification sent successfully',
      notification
    });
  } catch (error) {
    console.error('Error in sendNotificationToDriver:', error);
    res.status(500).json({ message: 'Error sending notification' });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const notification = await Notification.findOne({
      _id: notificationId,
      $or: [
        { recipient: userId },
        { recipient: 'all' }
      ]
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
}; 