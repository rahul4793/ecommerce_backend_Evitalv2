import { Request, Response } from 'express';
import {returnModel}  from '../models/returnModel'
const returnObj = new returnModel();

export const createReturnRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const { order_items_id, quantity, return_reason } = req.body;
        const result = await returnObj.processReturnRequest(userId, order_items_id, quantity, return_reason);
        if (result.error) {
            const statusCode = result.message === "You can only return items from your placed orders." ? 403 : 400;
             res.status(statusCode).json(result); return
        }
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in createReturnRequest controller:", error);
        res.status(500).json({ error: true, message: "Error processing return", data: {} });
    }
};

export const approveReturn = async (req: Request, res: Response): Promise<void> => {
    try {
        const { return_items_id } = req.body;
        const result = await returnObj.processReturnApproval(return_items_id);
        if (result.error) {
             res.status(400).json({error: true, message: "Error", data: null});   return
        }
        res.status(200).json(result); 
    } catch (error) {
        console.error("Error approving return in controller:", error);
        res.status(500).json({ error: true, message: "Error approving return", data: {} });
    }
};


export const getUserReturnHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const returnedItems = await returnObj.getUserReturnedItems(userId);
        if (returnedItems.error) {
            res.status(404).json({ error: true, message: "No return history found.", data: null });
            return;
        }
        res.status(200).json({ error: false, message: "Returned items fetched successfully", data: returnedItems.data });
    } catch (err) {
        console.error("Error fetching return history:", err);
        res.status(500).json({ error: true, message: "Error fetching return history", data: err });
    }
};
