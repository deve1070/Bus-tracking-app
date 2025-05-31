import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, ''),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
} as ServiceAccount;

// Validate required environment variables
const requiredEnvVars = [
  'FIREBASE_TYPE',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID',
  'FIREBASE_AUTH_URI',
  'FIREBASE_TOKEN_URI',
  'FIREBASE_AUTH_PROVIDER_CERT_URL',
  'FIREBASE_CLIENT_CERT_URL'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    process.exit(1);
  }
}

export class FirebaseService {
  /**
   * Send notification to a specific device
   */
  static async sendToDevice(deviceToken: string, notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }) {
    try {
      const message: admin.messaging.Message = {
        token: deviceToken,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data
      };

      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple devices
   */
  static async sendToDevices(deviceTokens: string[], notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }) {
    try {
      const message: admin.messaging.MulticastMessage = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data,
        tokens: deviceTokens
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      console.log('Successfully sent messages:', response);
      return response;
    } catch (error) {
      console.error('Error sending messages:', error);
      throw error;
    }
  }

  /**
   * Send notification to a topic
   */
  static async sendToTopic(topic: string, notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }) {
    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data
      };

      const response = await admin.messaging().send(message);
      console.log('Successfully sent message to topic:', response);
      return response;
    } catch (error) {
      console.error('Error sending message to topic:', error);
      throw error;
    }
  }

  /**
   * Subscribe device to a topic
   */
  static async subscribeToTopic(deviceToken: string, topic: string) {
    try {
      const response = await admin.messaging().subscribeToTopic(deviceToken, topic);
      console.log('Successfully subscribed to topic:', response);
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
      console.log('Successfully unsubscribed from topic:', response);
      return response;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      throw error;
    }
  }
} 