import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import { catchAsync } from '../utils/CatchAsync.js';

const prisma = new PrismaClient();

// Create a new sale (or multiple)
const createSale = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { productId, orderId, quantity, totalAmount, saleDate } = req.body;

  // Basic validation
  if (!productId || !orderId || !quantity || !totalAmount) {
    return res.status(400).json({
      message: 'Fields productId, orderId, quantity, and totalAmount are required.',
    });
  }

  const sale = await prisma.sale.create({
    data: {
      productId,
      orderId,
      quantity,
      totalAmount,
      saleDate: saleDate ? new Date(saleDate) : new Date(), // fallback to now
    },
  });

  return res.status(201).json({
    message: 'Sale created successfully.',
    sale,
  });
});

// Get all sales
const getSales = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const sales = await prisma.sale.findMany({
    include: {
      product: true, // Include product details if relation exists
    },
    orderBy: { saleDate: 'desc' },
  });

  res.json(sales);
});

// Get sale by ID
const getSaleById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { product: true },
  });

  if (!sale) return res.status(404).json({ message: 'Sale not found' });

  res.json(sale);
});

// Update a sale
const updateSale = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

  const { productId, quantity, totalPrice, saleDate } = req.body;
  const data: Record<string, any> = {};

  if (productId !== undefined) data.productId = productId;
  if (quantity !== undefined) data.quantity = quantity;
  if (totalPrice !== undefined) data.totalPrice = totalPrice;
  if (saleDate !== undefined) data.saleDate = saleDate;

  const updated = await prisma.sale.update({
    where: { id },
    data,
  });

  res.json(updated);
});

// Delete a sale
const deleteSale = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

  await prisma.sale.delete({ where: { id } });

  res.sendStatus(204);
});

// Search sales by product name (if joined)
const searchSales = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const query = String(req.query.product || '');
  if (!query) return res.status(400).json({ message: 'Product query is required' });

  const results = await prisma.sale.findMany({
    where: {
      product: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
    },
    include: { product: true },
  });

  res.json(results);
});

export {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
  searchSales,
};
