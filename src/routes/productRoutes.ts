import express from 'express';
import { authenticateUser, debounceMiddleware, isAdmin } from '../middleware/authMiddleware';

import {
    createProductController,
    getProductsController,
    getProductController,
    updateProductController,
    deleteProductController,
    getProductByCategoryController
} from '../controllers/productController';
import { productValidating, productValidatingUpdate } from '../validations/productValidation';
import validateRequest from '../middleware/validateRequest';
import { validateParams } from '../validations/routesValidation';


const router = express.Router();

router.get('/', getProductsController);
router.get('/:id', getProductController);
router.get('/category/:id',getProductByCategoryController);

router.post('/', authenticateUser, debounceMiddleware(300),isAdmin,validateRequest(productValidating),createProductController);
router.put('/:id', authenticateUser, isAdmin, validateRequest(productValidatingUpdate),validateParams,updateProductController);

router.delete('/:id', authenticateUser, isAdmin, validateParams,deleteProductController);

export default router;
