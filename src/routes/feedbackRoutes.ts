import express from 'express';
import {
    feedbackGiverController,feedbackViewerController
} from '../controllers/feedBackController';
import { authenticateUser } from '../middleware/authMiddleware';
import { feedbackValid } from '../validations/feedbackValidation';
import validateRequest from '../middleware/validateRequest';
import { validateParams } from '../validations/routesValidation';

const router = express.Router();

router.get('/viewFeedback/:id', validateParams,authenticateUser, feedbackViewerController);
router.post('/addFeedback',authenticateUser, validateRequest(feedbackValid),feedbackGiverController);


export default router;
