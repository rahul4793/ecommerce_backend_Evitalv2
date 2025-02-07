import express from 'express';
import { createReturnRequest, approveReturn, getUserReturnHistory } from '../controllers/returnController';
import {authenticateUser,debounceMiddleware,isAdmin} from '../middleware/authMiddleware';
import validateRequest from '../middleware/validateRequest';
import { approveValidating, returnValidating } from '../validations/returnValidation';

const router = express.Router();

router.post('/request',debounceMiddleware(300), authenticateUser, validateRequest(returnValidating),createReturnRequest);

router.post('/approve', authenticateUser, isAdmin,validateRequest(approveValidating), approveReturn);

router.get('/getReturnDetails',authenticateUser,getUserReturnHistory);

export default router;
