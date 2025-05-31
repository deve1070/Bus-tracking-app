import http from 'http';
import app from './app';

const server = http.createServer(app);

// Start server
const PORT = 3000; // Force using port 3000
const MAX_PORT_RETRIES = 10;

const startServer = async () => {
  const tryPort = async (port: number, retries: number = 0): Promise<void> => {
    if (retries >= MAX_PORT_RETRIES) {
      throw new Error(`Could not find an available port after ${MAX_PORT_RETRIES} attempts`);
    }

    return new Promise((resolve, reject) => {
      server.once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} is busy, trying ${port + 1}`);
          resolve(tryPort(port + 1, retries + 1));
        } else {
          reject(err);
        }
      });

      server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        resolve();
      });
    });
  };

  try {
    await tryPort(PORT);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Handle server errors
server.on('error', (error: Error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Handle uncaught exceptions
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
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer();
