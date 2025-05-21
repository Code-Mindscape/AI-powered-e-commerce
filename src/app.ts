import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import pkg from 'express-openid-connect';
import { authConfig } from './config/auth0.js';
import session from 'express-session';
const { auth, requiresAuth } = pkg;

import productsRouter from './routes/products.route.js';
import categoriesRouter from './routes/categories.route.js';

import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(errorHandler);

// Session Middleware
app.use(
  session({
    secret: process.env.AUTH_SECRET || 'your-fallback-secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Debug /callback
app.use((req, res, next) => {
  if (req.path === '/callback') {
    console.log('Callback request query:', req.query);
  }
  next();
});

// Auth0 Middleware
app.use(auth(authConfig));

// Routes
app.get('/login', (req, res) => {
  res.oidc.login({
    returnTo: '/profile',
  });
});

app.get('/profile', requiresAuth(), (req: Request, res: Response) => {
  const { user } = req.oidc;
  res.json({ user });
});

app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

// Error Handlers
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'BadRequestError' && err.message === 'checks.state argument is missing') {
    console.error('Missing state parameter:', err);
    res.status(400).send('Invalid request: Please start login from /login or a protected route.');
  } else {
    next(err);
  }
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;