import express from 'express';
import eoidc from 'express-openid-connect';
import config from './config/index.js';
import { getRedisClient } from './config/redis.js';

const { auth, requiresAuth } = eoidc;

// Initialize Express
const app = express();

// Basic security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Verify Auth0 configuration exists
if (!config.auth0?.clientID || !config.auth0?.issuerBaseURL) {
  console.error('❌ Missing Auth0 configuration');
  process.exit(1);
}

// Auth middleware
app.use(auth(config.auth0));

// Simple Redis connection wrapper
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

// Routes
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    authenticated: req.oidc?.isAuthenticated?.() || false
  });
});

app.get('/profile', requiresAuth(), (req, res) => {
  // Basic protection: don't expose full access token
  const { user, accessToken } = req.oidc;
  res.json({
    user,
    hasToken: !!accessToken?.access_token
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('⚠️ Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

// Server startup
async function startServer() {
  const PORT = process.env.PORT || 3000;
  
  try {
    // Connect to Redis first
    const redis = await initializeRedis();
    
    // Graceful shutdown handler
    const shutdown = async () => {
      console.log('🛑 Shutting down...');
      await redis.quit();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
startServer();