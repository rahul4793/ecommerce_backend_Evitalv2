import { Request, Response } from 'express';
import {feedbackModel}  from '../models/feedbackModel'

const feedbackOBj =  new feedbackModel();
export const feedbackViewerController = async (req: Request, res: Response): Promise<void> => {
    try {
        const feedbackResult = await feedbackOBj.getFeedbacks(Number(req.params.id));
        res.status(200).json(feedbackResult);
    } catch (err) {
        res.status(500).json({
            error: true,
            message: "Server error while fetching feedback",
            data: {}
        });
    }
};


export const feedbackGiverController = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const { ratings, products_id } = req.body;
        const feedbackResult = await feedbackOBj.addFeedback(ratings, products_id, userId);
        if (feedbackResult.error) {
             res.status(feedbackResult.message === "You can only review products you have purchased." ? 403 : 500).json(feedbackResult); return
        }
        res.status(201).json(feedbackResult); 
    } catch (err) {
        console.error("Error in feedbackGiverController:", err);
        res.status(500).json({
            error: true,
            message: "Error while adding feedback",
            data: {}
        });
    }
};