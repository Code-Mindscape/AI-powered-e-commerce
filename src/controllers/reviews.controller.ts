import { PrismaClient } from '../generated/prisma/client.js';
import { catchAsync } from '../utils/CatchAsync.js';

const prisma = new PrismaClient();

// Create a new review
export const createReview = catchAsync(async (req, res) => {
  const { productId, customerId, rating, comment } = req.body;

  if (!productId || !customerId || !rating) {
    res.status(400);
    throw new Error("productId, customerId, and rating are required.");
  }

  const newReview = await prisma.review.create({
    data: {
      productId,
      customerId,
      rating,
      comment,
    },
  });

  res.status(201).json(newReview);
});

// Get all reviews for a product with customer details
export const getReviewsByProduct = catchAsync(async (req, res) => {
  const productId = parseInt(req.params.productId);

  if (isNaN(productId)) {
    res.status(400);
    throw new Error("Invalid productId parameter.");
  }

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { reviewDate: 'desc' },
  });

  res.json(reviews);
});

// Delete a review by id
export const deleteReview = catchAsync(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400);
    throw new Error("Invalid review ID.");
  }

  await prisma.review.delete({
    where: { id },
  });

  res.status(204).send();
});
