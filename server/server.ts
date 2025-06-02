import 'dotenv/config';
import { app, io, httpServer } from './app';

// Force port 3000
const PORT = 3000;
console.log('Starting server on port:', PORT);

// Log environment variables for debugging
console.log('Email configuration:', {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD ? '****' : 'not set'
});

const startServer = async () => {
  return new Promise((resolve, reject) => {
    // Kill any process using port 3000
    const { exec } = require('child_process');
    exec(`lsof -ti:${PORT} | xargs kill -9 2>/dev/null`, () => {
      // Start the server
      httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
        console.log('Server is accessible at:');
        console.log(`- http://localhost:${PORT}`);
        console.log(`- http://10.42.0.158:${PORT}`);
        resolve(true);
      });

      httpServer.once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is already in use. Please free up the port and try again.`);
          process.exit(1);
        } else {
          console.error('Error starting server:', err);
          reject(err);
        }
      });
    });
  });
};

// Handle server errors
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
