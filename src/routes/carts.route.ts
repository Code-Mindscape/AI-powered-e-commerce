import express from 'express';
import {
  addToCart,
  getCartByCustomer,
  removeCartItem,
  clearCart,
} from '../controllers/carts.controller.js';

const router = express.Router();

// Add a product to cart (create cart if needed)
// POST /api/cart
router.post('/add', addToCart);
router.get('/:id', getCartByCustomer);
router.delete('/item/:cartItemId', removeCartItem);
router.delete('/:customerId/clear', clearCart);

export default router;
