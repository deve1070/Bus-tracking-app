import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = require('../config/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount)
});

export class FirebaseService {
  /**
   * Send notification to a specific device
   */
  static async sendToDevice(deviceToken: string, notification: {
    title: string;
    body: string;
    data?: { [key: string]: string };
  }) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {},
        token: deviceToken
      };

      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple devices
   */
  static async sendToDevices(deviceTokens: string[], notification: {
    title: string;
    body: string;
    data?: { [key: string]: string };
  }) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {},
        tokens: deviceTokens
      };

      const response = await (admin.messaging() as any).sendMulticast(message);
      return response;
    } catch (error) {
      console.error('Error sending notifications:', error);
      throw error;
    }
  }

  /**
   * Send notification to a topic
   */
  static async sendToTopic(topic: string, notification: {
    title: string;
    body: string;
    data?: { [key: string]: string };
  }) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {},
        topic: topic
      };

      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      console.error('Error sending topic notification:', error);
      throw error;
    }
  }

  /**
   * Subscribe device to a topic
   */
  static async subscribeToTopic(deviceToken: string, topic: string) {
    try {
      const response = await admin.messaging().subscribeToTopic(deviceToken, topic);
      return response;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe device from a topic
   */
  static async unsubscribeFromTopic(deviceToken: string, topic: string) {
    try {
      const response = await admin.messaging().unsubscribeFromTopic(deviceToken, topic);
      return response;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      throw error;
    }
  }
} 