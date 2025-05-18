// server.ts
import app from './app.js';
import eoidc from 'express-openid-connect';
const { auth, requiresAuth } = eoidc;
import express from 'express';
import config from './config/index.js';
import { getRedisClient } from './config/redis.js'

const PORT = process.env.PORT || 3000;

// Initialize Redis
async function initializeRedis() {
  try {
    const redis = await getRedisClient();
    await redis.set('server-status', 'active');
    console.log('✅ Redis connected');
    return redis;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    process.exit(1);
  }
}

// Verify Auth0 configuration
if (!config.auth0?.clientID || !config.auth0?.issuerBaseURL) {
  console.error('❌ Missing Auth0 configuration');
  process.exit(1);
}

// Auth0 middleware
app.use(auth(config.auth0));

// Protected route example
app.get('/profile', requiresAuth(), (req: express.Request, res: express.Response) => {
  const { user, accessToken } = req.oidc;
  res.json({
    user,
    hasToken: !!accessToken?.access_token
  });
});

// Start the server
async function startServer() {
  const redis = await initializeRedis();

  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('🛑 Shutting down...');
    await redis.quit();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();
