import express from 'express';
import { authenticateUser, debounceMiddleware, isAdmin } from '../middleware/authMiddleware';
import { 
    getCart, 
    addToCart, 
    updateCartItem, 
    removeCartItem, 
    clearCart 
} from '../controllers/cartController';
import { validateParams } from '../validations/routesValidation';
import { cartValid } from '../validations/addCartValidation';
import validateRequest from '../middleware/validateRequest';

const router = express.Router();

router.get('/', authenticateUser, getCart);               
router.post('/add', debounceMiddleware(300),authenticateUser, validateRequest(cartValid),addToCart);         
router.put('/update/:itemId',authenticateUser,updateCartItem);  
router.delete('/remove/:itemId',authenticateUser,removeCartItem);  
router.delete('/clear', authenticateUser, clearCart);    

export default router;
