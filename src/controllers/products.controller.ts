import { Request, Response, NextFunction } from 'express';
import { PrismaClient, ProductImage } from '../generated/prisma/client.js';
import { CloudinaryService } from '../services/cloudinary.service.js';

const prisma = new PrismaClient();
const cloudinaryService = new CloudinaryService();

// Create a new product
const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sku, name, description, price, stock, categoryId, sellerId, supplierId } = req.body;

    // Basic validation
    if (!sku || !name || price == null || stock == null || !categoryId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check for duplicate SKU
    const existingProduct = await prisma.product.findUnique({ where: { sku } });
    if (existingProduct) {
      return res.status(400).json({ message: 'SKU already exists' });
    }

    // Validate categoryId exists
    const category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
    if (!category) {
      return res.status(400).json({ message: 'Invalid categoryId' });
    }

    const productData = {
      sku,
      name,
      description: description || undefined,
      price: Number(price),
      stock: Number(stock),
      categoryId: Number(categoryId),
      sellerId: sellerId !== undefined ? Number(sellerId) : undefined,
      supplierId: supplierId !== undefined ? Number(supplierId) : undefined,
    };

    const product = await prisma.product.create({
      data: productData,
      include: { images: true },
    });

    const files = req.files as Express.Multer.File[];
    let uploadedImages: ProductImage[] = [];

    if (files && files.length > 0) {
      // Convert Multer file buffers to base64 for Cloudinary upload
      const uploadPromises = files.map(file => {
        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        return cloudinaryService.uploadImage(base64Image);
      });

      const imageUrls = await Promise.all(uploadPromises);

      // Create ProductImage records for each uploaded image
      const imageData = imageUrls.map(url => ({
        productId: product.id,
        imageUrl: url,
      }));

      await prisma.productImage.createMany({
        data: imageData,
      });

      uploadedImages = await prisma.productImage.findMany({
        where: { productId: product.id },
      });
    }

    res.status(201).json({
      message: 'Product created successfully',
      product: {
        ...product,
        images: uploadedImages,
      },
      imageUrls: uploadedImages.map(image => image.imageUrl),
    });
  } catch (error) {
    next(error);
  }
};

// Get all products
const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.product.findMany({
      include: {
        images: true,
        category: true,
      },
    });
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
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const item = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
      },
    });
    if (!item) {
      return res.status(404).json({ message: 'Product not found' });
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
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const { sku, name, description, price, stock, categoryId, sellerId, supplierId } = req.body;
    const data: Record<string, any> = {};

    if (sku !== undefined) {
      const existingProduct = await prisma.product.findFirst({
        where: { sku, NOT: { id } },
      });
      if (existingProduct) {
        return res.status(400).json({ message: 'SKU already exists' });
      }
      data.sku = sku;
    }
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = Number(price);
    if (stock !== undefined) data.stock = Number(stock);
    if (categoryId !== undefined) {
      const category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
      if (!category) {
        return res.status(400).json({ message: 'Invalid categoryId' });
      }
      data.categoryId = Number(categoryId);
    }
    if (sellerId !== undefined) data.sellerId = Number(sellerId);
    if (supplierId !== undefined) data.supplierId = Number(supplierId);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const files = req.files as Express.Multer.File[];
    let updatedImages: ProductImage[] = [];

    if (files && files.length > 0) {
      // Delete existing images from Cloudinary and database
      const existingImages = await prisma.productImage.findMany({
        where: { productId: id },
      });

      // Delete from Cloudinary using CloudinaryService
      const deletePromises = existingImages.map(image => {
        const publicId = image.imageUrl.split('/').pop()?.split('.')[0] || '';
        return cloudinaryService.deleteImage(`ecommerce/products/${publicId}`);
      });
      await Promise.all(deletePromises);

      // Delete from database
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });

      // Upload new images to Cloudinary
      const uploadPromises = files.map(file => {
        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        return cloudinaryService.uploadImage(base64Image);
      });

      const imageUrls = await Promise.all(uploadPromises);

      // Create new ProductImage records
      const imageData = imageUrls.map(url => ({
        productId: id,
        imageUrl: url,
      }));

      await prisma.productImage.createMany({
        data: imageData,
      });

      updatedImages = await prisma.productImage.findMany({
        where: { productId: id },
      });
    } else {
      updatedImages = await prisma.productImage.findMany({
        where: { productId: id },
      });
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: {
        images: true,
        category: true,
      },
    });

    res.json({
      message: 'Product updated successfully',
      product: {
        ...updated,
        images: updatedImages,
      },
      imageUrls: updatedImages.map(image => image.imageUrl),
    });
  } catch (error) {
    next(error);
  }
};

// Delete a product
const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete associated images from Cloudinary and database
    const existingImages = await prisma.productImage.findMany({
      where: { productId: id },
    });

    const deletePromises = existingImages.map(image => {
      const publicId = image.imageUrl.split('/').pop()?.split('.')[0] || '';
      return cloudinaryService.deleteImage(`ecommerce/products/${publicId}`);
    });
    await Promise.all(deletePromises);

    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

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
      return res.status(400).json({ message: 'Name query is required' });
    }

    const results = await prisma.product.findMany({
      where: { name: { contains: nameQuery, mode: 'insensitive' } },
      include: {
        images: true,
        category: true,
      },
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