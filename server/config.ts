export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/bus-tracking',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  firebaseConfig: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  },
  chapa: {
    secretKey: process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    publicKey: process.env.CHAPA_PUBLIC_KEY || 'CHAPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    apiKey: process.env.CHAPA_API_KEY || 'CHAPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:3000'
}; 