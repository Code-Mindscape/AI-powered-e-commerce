import express from 'express';
import {
  createReview,
  getReviewsByProduct,
  deleteReview,
} from '../controllers/reviews.controller.js';

const router = express.Router();

router.post('/', createReview);
router.get('/product/:productId', getReviewsByProduct);
router.delete('/:id', deleteReview);

export default router;
