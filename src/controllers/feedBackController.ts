import { Request, Response } from 'express';
import {feedbackModel}  from '../models/feedbackModel'
import { helper } from '../helpers/responseHelper';

const objHelper  =  new helper();
const feedbackOBj =  new feedbackModel();
export const feedbackViewerController = async (req: Request, res: Response): Promise<void> => {
    try {
        const feedbackResult = await feedbackOBj.getFeedbacks(Number(req.params.id));
        res.status(200).json(feedbackResult);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};

export const feedbackGiverController = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const { ratings, products_id } = req.body;
        const feedbackResult = await feedbackOBj.addFeedback(ratings, products_id, userId);
         if(feedbackResult.error){
                    objHelper.error(res, 400, feedbackResult.message);
                }
                objHelper.success(res, feedbackResult.message, feedbackResult.data);
            } catch (err) {
                objHelper.error(res, 500, "Server Error");
            }
        };
