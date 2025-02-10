import express from 'express';
import { signup, loginUser,logout, getUserProfile, updateUserProfile, deleteUserById, getUserByEmail} from '../controllers/userController';
import validateRequest from '../middleware/validateRequest'; 
import { userSignupSchema, userLoginSchema, updateUserSchema, emailRequired, userIdRequired } from '../validations/userValidation';
import { authenticateUser ,debounceMiddleware,isAdmin} from '../middleware/authMiddleware';
import { validateParams } from '../validations/routesValidation';

const router = express.Router();


router.post('/signup', debounceMiddleware(300),validateRequest(userSignupSchema), signup);
router.post('/login', debounceMiddleware(300),validateRequest(userLoginSchema), loginUser);
router.post('/logout',debounceMiddleware(300), authenticateUser, logout); 


router.get('/me', authenticateUser, validateRequest(userIdRequired),getUserProfile);
router.patch('/me', authenticateUser, validateRequest(updateUserSchema),updateUserProfile);     
router.get('/email/me',authenticateUser, validateRequest(emailRequired),getUserByEmail);
router.delete('/:id', authenticateUser,validateParams, isAdmin, deleteUserById);

export default router;

