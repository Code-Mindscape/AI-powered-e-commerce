import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import { catchAsync } from '../utils/CatchAsync.js';

const prisma = new PrismaClient();

/**
 * Create or ensure a cart exists,
 * then add a product (or update quantity) in one call.
 * POST /api/cart
 * Body: { customerId: number, productId: number, quantity?: number }
 */
export const addToCart = catchAsync(async (req: Request, res: Response) => {
  const { customerId, productId, quantity = 1 } = req.body;

  // Ensure cart exists (create if needed)
  const cart = await prisma.cart.upsert({
    where: { customerId: Number(customerId) },
    create: { customerId: Number(customerId) },
    update: {},
  });

  // Add or update cart item
  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId: Number(productId) },
  });

  let cartItem;
  if (existing) {
    cartItem = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + Number(quantity) },
      include: { product: true },
    });
  } else {
    cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: Number(productId),
        quantity: Number(quantity),
      },
      include: { product: true },
    });
  }

  res.status(201).json({ success: true, data: cartItem });
});

/**
 * Retrieve a customer's cart with items and products.
 * GET /api/cart/:customerId
 */
export const getCartByCustomer = catchAsync(async (req: Request, res: Response) => {
  const customerId = Number(req.params.id);

  const cart = await prisma.cart.findUnique({
    where: { customerId },
    include: { cartItems: { include: { product: true } } },
  });

  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found.' });
  }

  res.status(200).json({ success: true, data: cart });
});

/**
 * Remove a single item from the cart.
 * DELETE /api/cart/item/:cartItemId
 */
export const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const cartItemId = Number(req.params.cartItemId);

  await prisma.cartItem.delete({ where: { id: cartItemId } });

  res.status(200).json({ success: true, message: 'Cart item removed.' });
});

/**
 * Clear all items from a customer's cart.
 * DELETE /api/cart/:customerId/clear
 */
export const clearCart = catchAsync(async (req: Request, res: Response) => {
  const customerId = Number(req.params.customerId);

  const cart = await prisma.cart.findUnique({ where: { customerId } });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found.' });
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  res.status(200).json({ success: true, message: 'Cart cleared.' });
});
