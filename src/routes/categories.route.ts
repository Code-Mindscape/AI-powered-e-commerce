import express from 'express';
import {
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  searchCategories,
  createCategories,
} from '../controllers/categories.controller.js';

const router = express.Router();

router.post('/add', createCategories);
router.get('/all', getCategories);
router.get('/search', searchCategories);
router.get('/:id', getCategoryById);
router.put('/update/:id', updateCategory);
router.delete('/delete/:id', deleteCategory);

export default router;
