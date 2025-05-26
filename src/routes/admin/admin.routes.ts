import { Router } from 'express';
import adminController from '../../controllers/admin/admin.controller.js';

const router = Router();

router.post('/register-admin', adminController.registerAdmin);
// router.post('/login-admin', adminController.loginAdmin);

export default router;