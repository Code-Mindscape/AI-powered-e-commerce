import express, { Request, Response } from 'express';
import eoidc from 'express-openid-connect';
const { auth, requiresAuth } = eoidc; // <-- Destructure from default
import config from './config/index.js'; // Assuming your config is JS (can be TS too)
import { getRedisClient } from './config/redis.js';


const app = express();

// Middleware: Auth routes - login, logout, callback
app.use(auth(config.auth0));


async function someFunction() {
  const redis = await getRedisClient();
  await redis.set('key', 'value');
}

// Home route
app.get('/', (req: Request, res: Response) => {
  const isAuthenticated = req.oidc?.isAuthenticated?.();
  res.send(isAuthenticated ? 'Logged in' : 'Logged out');
});

// Protected profile route
app.get('/profile', requiresAuth(), (req: Request, res: Response) => {
  res.json(req.oidc?.user);
});

someFunction()
// Server init
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

