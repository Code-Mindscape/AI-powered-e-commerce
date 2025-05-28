import { Request, Response } from 'express';
import {PrismaClient} from '../generated/prisma/client.js';
import {catchAsync} from '../utils/CatchAsync.js';


const prisma = new PrismaClient();
// Create new inventory item
export const createInventory = catchAsync(async (req: Request, res: Response) => {
  const { productId, quantity, warehouseLocation } = req.body;

  // Basic validation
  if (!productId || typeof quantity !== 'number') {
    return res.status(400).json({ error: 'Missing required fields or invalid types' });
  }

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Prevent negative inventory
  if (quantity < 0) {
    return res.status(400).json({ error: 'Quantity cannot be negative' });
  }

  // Create inventory
  const inventory = await prisma.inventory.create({
    data: {
      productId,
      quantity,
      warehouseLocation
    },
    include: { product: true }
  });

  res.status(201).json(inventory);
});

// Get all inventory items with pagination
export const getInventory = catchAsync(async (req: Request, res: Response) => {
  // Parse pagination parameters with defaults
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 10));
  const skip = (page - 1) * pageSize;
  
  const [inventory, totalCount] = await Promise.all([
    prisma.inventory.findMany({
      skip,
      take: pageSize,
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.inventory.count()
  ]);

  res.json({
    data: inventory,
    pagination: {
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      totalItems: totalCount
    }
  });
});

// Get single inventory item by ID
export const getInventoryById = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

  const inventory = await prisma.inventory.findUnique({
    where: { id },
    include: { product: true }
  });

  if (!inventory) {
    return res.status(404).json({ error: 'Inventory record not found' });
  }
  
  res.json(inventory);
});

// Update inventory item
export const updateInventory = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

  const { quantity, warehouseLocation } = req.body;

  // Prevent negative inventory
  if (typeof quantity === 'number' && quantity < 0) {
    return res.status(400).json({ error: 'Inventory quantity cannot be negative' });
  }

  const inventory = await prisma.inventory.update({
    where: { id },
    data: {
      ...(typeof quantity === 'number' && { quantity }),
      ...(warehouseLocation && { warehouseLocation })
    },
    include: { product: true }
  });

  res.json(inventory);
});

// Delete inventory item
export const deleteInventory = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

  await prisma.inventory.delete({
    where: { id }
  });
  
  res.status(204).send();
});

// Get inventory by product ID
export const getInventoryByProduct = catchAsync(async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId);
  if (isNaN(productId)) return res.status(400).json({ error: 'Invalid product ID format' });

  const inventory = await prisma.inventory.findFirst({
    where: { productId },
    include: { product: true }
  });

  if (!inventory) {
    return res.status(404).json({ error: 'Inventory not found for this product' });
  }
  
  res.json(inventory);
});

// Update stock levels (increment/decrement)
export const updateStockLevel = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

  const { adjustment } = req.body;
  if (typeof adjustment !== 'number') {
    return res.status(400).json({ error: 'Adjustment must be a number' });
  }

  const inventory = await prisma.inventory.findUnique({
    where: { id }
  });

  if (!inventory) {
    return res.status(404).json({ error: 'Inventory record not found' });
  }

  const newQuantity = inventory.quantity + adjustment;
  
  if (newQuantity < 0) {
    return res.status(400).json({ 
      error: `Adjustment would result in negative inventory (current: ${inventory.quantity}, adjustment: ${adjustment})` 
    });
  }

  const updatedInventory = await prisma.inventory.update({
    where: { id },
    data: { quantity: newQuantity },
    include: { product: true }
  });

  res.json(updatedInventory);
});