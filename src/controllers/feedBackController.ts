import { Request, Response } from 'express';
import { getFeedbacks, addFeedback, hasUserPurchasedProduct } from '../models/feedbackModel';
import { error } from 'console';

export const feedbackViewerController = async (req: Request, res: Response): Promise<void> => {
    try {
        const feedbackResult = await getFeedbacks(Number(req.params.id));

        if (feedbackResult.error) {
             res.status(500).json(feedbackResult); return
        }

        if (Array.isArray(feedbackResult.data) && feedbackResult.data.length === 0) {
             res.status(404).json({ error: true, message: "No feedback available", data: null }); return
        }

         res.status(200).json(feedbackResult); return
    } catch (err) {
        res.status(500).json({
            error: true,
            message: "Server error while fetching feedback",
            data: err
        });
    }
};

export const feedbackGiverController = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId; 
        const { ratings, products_id } = req.body;

        // Validate rating
        if (!ratings || ratings < 1 || ratings > 5) {
             res.status(400).json({ error: true, message: "Invalid rating. Must be between 1 and 5.",data:error });  return
        }

        // Check if the user has purchased the product
        const purchaseResult = await hasUserPurchasedProduct(userId, products_id);
        if (purchaseResult.error || !purchaseResult.data) {
             res.status(403).json({ error: true, message: "You can only review products you have purchased." ,data:error}); return
        }

        // Add feedback
        const feedbackResult = await addFeedback(ratings, products_id, userId);
        if (feedbackResult.error) {
             res.status(500).json(feedbackResult);return
        }

         res.status(201).json({error:true, message: "Feedback added successfully", data: feedbackResult.data }); return
    } catch (err) {
        console.error("Error while adding feedback:", err);
        res.status(500).json({
            error: true,
            message: "Error while adding feedback",
            data: err
        });
    }
};
