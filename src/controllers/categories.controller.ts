import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

// Create a new category
const createCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = req.body; // expecting an array of objects [{name, description}, ...]

    if (!Array.isArray(categories) || categories.length === 0) {
      res.status(400).json({ message: 'An array of categories is required' });
      return;
    }

    // Validate each category has a name
    for (const category of categories) {
      if (!category.name) {
        res.status(400).json({ message: 'Each category must have a name' });
        return;
      }
    }

    // Create categories in a transaction (atomic operation)
    const createdCategories = await prisma.$transaction(
      categories.map(cat => prisma.category.create({
        data: {
          name: cat.name,
          description: cat.description || undefined,
        }
      }))
    );

    res.status(201).json(createdCategories);
  } catch (error) {
    next(error);
  }
};

// Get all categories
const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.category.findMany({
      include: { products: true }, // Optional: include products in the response
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// Get a single category by ID
const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid ID' });
      return;
    }

    const item = await prisma.category.findUnique({
      where: { id },
      include: { products: true }, // Optional
    });

    if (!item) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
};

// Update a category
const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid ID' });
      return;
    }

    const { name, description } = req.body;
    const data: Record<string, any> = {};

    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;

    const updated = await prisma.category.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Delete a category
const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid ID' });
      return;
    }

    await prisma.category.delete({ where: { id } });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

// Search categories by name
const searchCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nameQuery = String(req.query.name || '');
    if (!nameQuery) {
      res.status(400).json({ message: 'Name query is required' });
      return;
    }

    const results = await prisma.category.findMany({
      where: { name: { contains: nameQuery, mode: 'insensitive' } },
    });

    res.json(results);
  } catch (error) {
    next(error);
  }
};

// Export all handlers
export {
  createCategories,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  searchCategories,
};
