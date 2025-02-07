import express from 'express';
import { authenticateUser, isAdmin } from '../middleware/authMiddleware';

import {
    createProductController,
    getProductsController,
    getProductController,
    updateProductController,
    deleteProductController,
    getProductByCategoryController
} from '../controllers/productController';
import { productValidating } from '../validations/productValidation';
import validateRequest from '../middleware/validateRequest';
import { validateParams } from '../validations/routesValidation';


const router = express.Router();

router.get('/', getProductsController);
router.get('/:id', getProductController);
router.get('/category/:id',getProductByCategoryController);

router.post('/', authenticateUser, isAdmin,validateRequest(productValidating), validateParams,createProductController);
router.put('/:id', authenticateUser, isAdmin, validateRequest(productValidating),validateParams,updateProductController);
router.delete('/:id', authenticateUser, isAdmin, validateParams,deleteProductController);

export default router;
