import express from 'express';
import {
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  searchCategories,
  createCategories,
} from '../controllers/categories.controller.js';

import pkg from 'express-openid-connect';
const { requiresAuth } = pkg;

const router = express.Router();



router.post('/add',requiresAuth() ,createCategories);
router.get('/all',requiresAuth(), getCategories);
router.get('/search', searchCategories);
router.get('/:id', getCategoryById);
router.put('/update/:id', updateCategory);
router.delete('/delete/:id', deleteCategory);

export default router;
