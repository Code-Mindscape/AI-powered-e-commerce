import { Request, Response, NextFunction } from 'express';
import { PrismaClient, ProductImage } from '../generated/prisma/client.js';
import { CloudinaryService } from '../services/cloudinary.service.js';

const prisma = new PrismaClient();
const cloudinaryService = new CloudinaryService();

// Create a new product
const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { sku, name, price, stock, categoryId, sellerId, supplierId } = req.body;

    if (!sku || !name || price == null || stock == null || !categoryId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingProduct = await prisma.product.findUnique({ where: { sku } });
    if (existingProduct) {
      return res.status(400).json({ message: 'SKU already exists' });
    }

    const category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
    if (!category) {
      return res.status(400).json({ message: 'Invalid categoryId' });
    }

    const files = req.files as Express.Multer.File[];
    let uploadedImages: ProductImage[] = [];
    let productImageId: number | null = null;

    if (files?.length) {
      const uploadPromises = files.map(file => {
        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        return cloudinaryService.uploadImage(base64Image);
      });

      const imageUrls = await Promise.all(uploadPromises);

      const productImage = await prisma.productImage.create({
        data: {
          productId: null,
          imagesUrls: imageUrls,
        },
      });

      productImageId = productImage.id;
    }

    const productData = {
      sku,
      name,
      price: Number(price),
      stock: Number(stock),
      categoryId: Number(categoryId),
      sellerId: sellerId ? Number(sellerId) : undefined,
      supplierId: supplierId ? Number(supplierId) : undefined,
      images: productImageId ? { connect: [{ id: productImageId }] } : undefined,
    };

    const product = await prisma.product.create({
      data: productData,
      include: { images: true },
    });

    if (productImageId) {
      await prisma.productImage.update({
        where: { id: productImageId },
        data: { productId: product.id },
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
      imageUrls: uploadedImages.flatMap(image => image.imagesUrls),
    });
  } catch (error) {
    next(error);
  }
};

// Get all products
const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        category: true,
      },
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// Get single product by ID
const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Update product
const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const { sku, name, price, stock, categoryId, sellerId, supplierId } = req.body;
    const data: Record<string, any> = {};

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (sku !== undefined && sku !== product.sku) {
      const existingProduct = await prisma.product.findUnique({ where: { sku } });
      if (existingProduct) {
        return res.status(400).json({ message: 'SKU already exists' });
      }
      data.sku = sku;
    }

    if (categoryId !== undefined) {
      const category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
      if (!category) {
        return res.status(400).json({ message: 'Invalid categoryId' });
      }
      data.categoryId = Number(categoryId);
    }

    if (name !== undefined) data.name = name;
    if (price !== undefined) data.price = Number(price);
    if (stock !== undefined) data.stock = Number(stock);
    if (sellerId !== undefined) data.sellerId = Number(sellerId);
    if (supplierId !== undefined) data.supplierId = Number(supplierId);

    const files = req.files as Express.Multer.File[];
    let updatedImages: ProductImage[] = [];

    if (files?.length) {
      const existingImages = await prisma.productImage.findMany({
        where: { productId: id },
      });

      for (const image of existingImages) {
        for (const url of image.imagesUrls) {
          const publicId = url.split('/').pop()?.split('.')[0];
          if (publicId) await cloudinaryService.deleteImage(publicId);
        }
      }

      await prisma.productImage.deleteMany({
        where: { productId: id },
      });

      const uploadPromises = files.map(file => {
        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        return cloudinaryService.uploadImage(base64Image);
      });

      const imageUrls = await Promise.all(uploadPromises);

      const newImage = await prisma.productImage.create({
        data: {
          productId: id,
          imagesUrls: imageUrls,
        },
      });

      updatedImages = [newImage];
    } else {
      updatedImages = await prisma.productImage.findMany({
        where: { productId: id },
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        images: true
      },
    });

    res.json({
      message: 'Product updated successfully',
      product: {
        ...updatedProduct,
        images: updatedImages,
      },
      imageUrls: updatedImages.flatMap(img => img.imagesUrls),
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productImages = await prisma.productImage.findMany({
      where: { productId: id },
    });

    for (const image of productImages) {
      for (const url of image.imagesUrls) {
        const publicId = url.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinaryService.deleteImage(publicId);
      }
    }

    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    await prisma.product.delete({
      where: { id },
    });

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

// Search products
const searchProducts = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const nameQuery = String(req.query.name || '');
    if (!nameQuery) {
      return res.status(400).json({ message: 'Name query is required' });
    }

    const results = await prisma.product.findMany({
      where: { 
        name: { 
          contains: nameQuery, 
          mode: 'insensitive' 
        } 
      },
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

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
};