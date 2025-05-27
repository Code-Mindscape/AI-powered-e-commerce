// routes/order.routes.ts
import express from 'express';
import {
  createOrder,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrdersByCustomer,
} from '../controllers/orders.controller.js';

const router = express.Router();

router.post('/add', createOrder);
router.get('/:id', getOrderById);
router.get('/customer/:id', getOrdersByCustomer);
router.put('/update/:id', updateOrderStatus);
router.delete('/delete/:id', deleteOrder);

export default router;
