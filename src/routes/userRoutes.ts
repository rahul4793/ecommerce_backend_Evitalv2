import express from 'express';
import { signup, login,logout, getUserProfile, updateUserProfile, deleteUserById, getUserByEmail} from '../controllers/userController';
import validateRequest from '../middleware/validateRequest'; 
import { userSignupSchema, userLoginSchema } from '../validations/userValidation';
import { authenticateUser ,debounceMiddleware,isAdmin} from '../middleware/authMiddleware';

const router = express.Router();


router.post('/signup', debounceMiddleware(300),validateRequest(userSignupSchema), signup);
router.post('/login', debounceMiddleware(300),validateRequest(userLoginSchema), login);
router.post('/logout',debounceMiddleware(300), authenticateUser, logout); 


router.get('/me', authenticateUser, getUserProfile);
router.patch('/me', authenticateUser, updateUserProfile);     
router.get('/email/me',authenticateUser, getUserByEmail);
router.delete('/:id', authenticateUser, isAdmin, deleteUserById);

export default router;

