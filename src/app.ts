// app.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import productsRouter from './routes/products.route.js'; // Adjust the path as needed
import categoriesRouter from './routes/categories.route.js'; // Adjust the path as needed

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
