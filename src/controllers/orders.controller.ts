import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../generated/prisma/client.js'
import { catchAsync } from '../utils/CatchAsync.js';

const prisma = new PrismaClient();

export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const { customerId, orderItems } = req.body;

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Order must include at least one product with quantity.',
    });
  }

  let totalPrice = 0;
  const orderItemData = [];

  for (const item of orderItems) {
    const { productId, quantity } = item;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { price: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${productId} not found.`,
      });
    }

    const itemPrice = product.price * quantity;
    totalPrice += itemPrice;

    orderItemData.push({
      productId,
      quantity,
      price: product.price,
    });
  }

  const order = await prisma.order.create({
    data: {
      customerId,
      totalPrice,
      orderItems: {
        create: orderItemData,
      },
    },
    include: {
      orderItems: true,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully with total calculated.',
    data: order,
  });
});

// Get Single Order by ID (with OrderItems, Customer, Payment)
export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: {
      customer: true,
      orderItems: {
        include: {
          product: true,
        },
      },
      payment: true,
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found.',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Order retrieved successfully.',
    data: order,
  });
});

// Update Order Status
export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const updatedOrder = await prisma.order.update({
    where: { id: parseInt(id) },
    data: { status },
  });

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully.',
    data: updatedOrder,
  });
});

// Delete Order and Related OrderItems
export const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Ensure order exists
  const existingOrder = await prisma.order.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingOrder) {
    return res.status(404).json({
      success: false,
      message: 'Order not found.',
    });
  }

  // Delete related OrderItems first (optional if onDelete: Cascade is not set)
  await prisma.orderItem.deleteMany({
    where: { orderId: parseInt(id) },
  });

  // Then delete the order
  await prisma.order.delete({
    where: { id: parseInt(id) },
  });

  res.status(200).json({
    success: true,
    message: 'Order and its items deleted successfully.',
  });
});

// Get All Orders (optional controller)
export const getAllOrders = catchAsync(async (_req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      orderItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    message: 'All orders retrieved successfully.',
    data: orders,
  });
});


export const getOrdersByCustomer = catchAsync(async (req: Request, res: Response) => {
  const customerId = parseInt(req.params.id);

  if (isNaN(customerId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid customer ID.',
    });
  }

  const orders = await prisma.order.findMany({
    where: { customerId },
    include: {
      orderItems: true,
    },
    orderBy: {
      orderDate: 'desc',
    },
  });

  if (!orders.length) {
    return res.status(404).json({
      success: false,
      message: 'No orders found for this customer.',
    });
  }

  // Clean the response: remove nested product and customer info
  const cleanedOrders = orders.map(order => ({
    id: order.id,
    customerId: order.customerId,
    orderDate: order.orderDate,
    totalPrice: order.totalPrice,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    orderItems: order.orderItems.map(item => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
  }));

  res.status(200).json({
    success: true,
    message: `Found ${cleanedOrders.length} order(s) for customer ID ${customerId}.`,
    data: cleanedOrders,
  });
});
