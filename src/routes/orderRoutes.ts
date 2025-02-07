import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware';
import {isAdmin} from '../middleware/authMiddleware';
import {
    createOrder, getUserOrders, getAllOrders,
    updateOrderStatus, cancelOrder
} from '../controllers/orderController';
import { canceOorderValidating, orderValidating, updateOrderStatusValidating } from '../validations/orderValidation';
import validateRequest from '../middleware/validateRequest';

const router = express.Router();


router.post('/create', authenticateUser, validateRequest(orderValidating),createOrder);
router.get('/', authenticateUser, getUserOrders);
router.post('/cancel', authenticateUser, validateRequest(canceOorderValidating),cancelOrder);

router.get('/all', authenticateUser, isAdmin, getAllOrders);
router.put('/update-status', authenticateUser, isAdmin,validateRequest(updateOrderStatusValidating), updateOrderStatus);

export default router;


