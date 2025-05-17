import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to wrap async handlers
const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req, res, next)).catch(next);

// Helper to parse numeric ID
const getId = (param: string): number => {
  const id = Number(param);
  if (Number.isNaN(id)) throw new Error('Invalid ID');
  return id;
};

// Create a new product
const createProduct = wrap(async (req: Request, res: Response) => {
  // Extract expected fields from body
  const { sku, name, description, price, stock, categoryId, sellerId, supplierId } = req.body;
  // Basic validation
  if (!sku || !name || price == null || stock == null || !categoryId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const data = {
    sku,
    name,
    description: description || undefined,
    price: Number(price),
    stock: Number(stock),
    categoryId: Number(categoryId),
    sellerId: sellerId !== undefined ? Number(sellerId) : undefined,
    supplierId: supplierId !== undefined ? Number(supplierId) : undefined,
  };
  const product = await prisma.product.create({ data });
  res.status(201).json(product);
});

// Get all products
const getProducts = wrap(async (_req: Request, res: Response) => {
  const items = await prisma.product.findMany();
  res.json(items);
});

// Get a single product by ID
const getProductById = wrap(async (req: Request, res: Response) => {
  const id = getId(req.params.id);
  const item = await prisma.product.findUnique({ where: { id } });
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

// Update a product
const updateProduct = wrap(async (req: Request, res: Response) => {
  const id = getId(req.params.id);
  // Extract fields to update
  const { sku, name, description, price, stock, categoryId, sellerId, supplierId } = req.body;
  const data: any = {};
  if (sku !== undefined) data.sku = sku;
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (price !== undefined) data.price = Number(price);
  if (stock !== undefined) data.stock = Number(stock);
  if (categoryId !== undefined) data.categoryId = Number(categoryId);
  if (sellerId !== undefined) data.sellerId = Number(sellerId);
  if (supplierId !== undefined) data.supplierId = Number(supplierId);

  const updated = await prisma.product.update({ where: { id }, data });
  res.json(updated);
});

// Delete a product
const deleteProduct = wrap(async (req: Request, res: Response) => {
  const id = getId(req.params.id);
  await prisma.product.delete({ where: { id } });
  res.sendStatus(204);
});

// Search products by name
const searchProducts = wrap(async (req: Request, res: Response) => {
  const nameQuery = String(req.query.name || '');
  if (!nameQuery) {
    return res.status(400).json({ message: 'Name query is required' });
  }
  const results = await prisma.product.findMany({
    where: { name: { contains: nameQuery, mode: 'insensitive' } }
  });
  res.json(results);
});

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
};
