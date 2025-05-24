import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import upload from '../middlewares/multer.middleware.js';

const prisma = new PrismaClient();

// Create a new product
const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Use Multer middleware to handle single file upload (field name: 'image')
    upload.single('image')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ message: 'File upload error', error: err.message });
      }

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
        imageUrl: req.file ? req.file.path : undefined, // Add image path if uploaded
      };

      const product = await prisma.product.create({ data });
      res.status(201).json({
        message: 'Product created successfully',
        product,
        image: req.file ? { filename: req.file.filename, path: req.file.path, size: req.file.size } : null,
      });
    });
  } catch (error) {
    next(error);
  }
};

// Get all products
const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.product.findMany();
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// Get a single product by ID
const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid ID' });
      return
    }

    const item = await prisma.product.findUnique({ where: { id } });
    if (!item) {
      res.status(404).json({ message: 'Not found' });
      return
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
};

// Update a product
const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid ID' });
      return
    }

    const { sku, name, description, price, stock, categoryId, sellerId, supplierId } = req.body;
    const data: Record<string, any> = {};

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
  } catch (error) {
    next(error);
  }
};

// Delete a product
const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid ID' });
      return
    }

    await prisma.product.delete({ where: { id } });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

// Search products by name
const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nameQuery = String(req.query.name || '');
    if (!nameQuery) {
      res.status(400).json({ message: 'Name query is required' });
      return
    }

    const results = await prisma.product.findMany({
      where: { name: { contains: nameQuery, mode: 'insensitive' } },
    });

    res.json(results);
  } catch (error) {
    next(error);
  }
};

// Export all handlers
export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
};
