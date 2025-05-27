import express, { Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import pkg from 'express-openid-connect';
import { authConfig } from './config/auth0.js';
import productsRouter from './routes/products.route.js';
import categoriesRouter from './routes/categories.route.js';
import ordersRouter from './routes/order.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { configureCloudinary } from './config/cloudinary.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import adminRouter from './routes/admin/admin.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { auth, requiresAuth } = pkg;
const app = express();

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Serve uploads statically from src/uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// —————— Global Middleware ——————
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// —————— Cloudinary Config call ——————
configureCloudinary();

// —————— Session & Auth0 ——————
app.use(
  session({
    secret: process.env.AUTH_SECRET || 'your-fallback-secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(auth(authConfig));

// —————— Public Routes ——————
app.get('/', (req: Request, res: Response) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});
app.get('/login', (req, res) => {
  res.oidc.login({ returnTo: '/profile' });
});
app.get('/profile', requiresAuth(), (req: Request, res: Response) => {
  res.json({ user: req.oidc.user });
});
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

// —————— API Routes ——————
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);

// —————— Global Error Handler ——————
app.use(errorHandler);

export default app;