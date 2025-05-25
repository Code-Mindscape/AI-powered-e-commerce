import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
} from '../controllers/products.controller.js';
import upload from '../middlewares/multer.middleware.js';

const router = Router();

router.post('/add',upload.array('images', 4), createProduct);
router.get('/all', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
