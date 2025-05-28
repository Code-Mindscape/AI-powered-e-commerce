import express from 'express';
import {
  createInventory,
  getInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
  getInventoryByProduct,
  updateStockLevel
} from '../controllers/inventory.controller.js';

const router = express.Router();

router.post('/', createInventory);
router.get('/', getInventory);
router.get('/:id', getInventoryById);
router.put('/:id', updateInventory);
router.delete('/:id', deleteInventory);
router.get('/product/:productId', getInventoryByProduct);
router.patch('/:id/adjust-stock', updateStockLevel);

export default router;