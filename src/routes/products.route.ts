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
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();
authorizeRoles
router.post('/add',authorizeRoles(['admin', 'manager']) ,upload.array('images', 4), createProduct);
router.get('/all', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
