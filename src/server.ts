// src/server.ts

import dotenv from 'dotenv';
dotenv.config(); 
import app from './app.js';           // Your Express app (with Auth0 & routes)
// import { getRedisClient } from './config/redis.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  // 1. Initialize Redis
  // let redis;
  // try {
    // redis = await getRedisClient();
  //   await redis.set('server-status', 'active');
  //   // Connection log is already in getRedisClient()
  // } catch (err) {
  //   console.error('❌ Redis connection failed:', err);
  //   process.exit(1);
  // }

  // 2. Start HTTP server
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} ✅ `);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // 3. Graceful shutdown
  const shutdown = async () => {
    console.log('🛑 Shutting down...');
    // if (redis) {
    //   await redis.quit();
    //   console.log('🛑 Redis disconnected');
    // }
    server.close(() => {
      console.log('🛑 Server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();
