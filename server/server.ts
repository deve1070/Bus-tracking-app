import http from 'http';
import app from './app';

const server = http.createServer(app);

// Start server
const PORT = parseInt(process.env.PORT || '5000', 10);
const startServer = async () => {
  const tryPort = async (port: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      server.once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} is busy, trying ${port + 1}`);
          resolve(tryPort(port + 1));
        } else {
          reject(err);
        }
      });

      server.listen(port, () => {
        console.log(`Server running on port ${port}`);
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

startServer();
