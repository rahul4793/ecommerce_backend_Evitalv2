import express from 'express';
import { signup, login,logout, getUserProfile, updateUserProfile, deleteUserById, getUserByEmail} from '../controllers/userController';
import validateRequest from '../middleware/validateRequest'; 
import { userSignupSchema, userLoginSchema } from '../validations/userValidation';
import { authenticateUser ,isAdmin} from '../middleware/authMiddleware';

const router = express.Router();


router.post('/signup', validateRequest(userSignupSchema), signup);
router.post('/login', validateRequest(userLoginSchema), login);
router.post('/logout', authenticateUser, logout); 


router.get('/me', authenticateUser, getUserProfile);
router.patch('/me', authenticateUser, updateUserProfile);     
router.get('/email/me',authenticateUser, getUserByEmail);
router.delete('/:id', authenticateUser, isAdmin, deleteUserById);

export default router;

