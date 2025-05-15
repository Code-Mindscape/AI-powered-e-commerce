
import redisClient from './config/redis.js';
import express from 'express';
import eoidc from 'express-openid-connect'; // <-- Default import
const { auth, requiresAuth } = eoidc; // <-- Destructure from default
import config from './config/index.js';;    // ← note “.js” here

const app = express();

// attach /login, /logout, /callback
app.use(auth(config.auth0));


(async () => {
  await redisClient.set('testKey', 'Hello, Redis!');
  const value = await redisClient.get('testKey');
  console.log(value); // Should output: 'Hello, Redis!'
})();



app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.json(req.oidc.user);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
