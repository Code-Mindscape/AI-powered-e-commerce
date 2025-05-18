import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  searchCategories,
} from '../controllers/categories.controller.js';

const router = express.Router();

router.post('/add', createCategory);
router.get('/categories', getCategories);
router.get('/categories/search', searchCategories);
router.get('/categories/:id', getCategoryById);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

export default router;
