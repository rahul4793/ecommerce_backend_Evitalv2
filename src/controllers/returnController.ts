import { Request, Response } from 'express';
import {
    checkUserOrderStatus,
    getOrderedQuantity,
    requestReturn,
    addReturnItemDetails,
    approveReturnRequest,
    calculateRefundAmount,
    updateStockAfterReturn,
    getReturnedQuantity,
    getUserReturnedItems
} from '../models/returnModel';

export const createReturnRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const { order_items_id, quantity, return_reason } = req.body;

        // Verify user ordered this product and order is in status 1 meaning its placed
        const orderValid = await checkUserOrderStatus(userId, order_items_id);
        if (!orderValid) {
            res.status(403).json({ error: true, message: "You can only return items from your placed orders.", data: null });
            return;
        }

        // Get Ordered & Already Returned Quantity so that the user can return only that quantity which they have ordered
        const orderedQuantity = await getOrderedQuantity(order_items_id);
        const alreadyReturnedQuantity = await getReturnedQuantity(order_items_id);

        // Check if total return quantity exceeds ordered quantity
        if (alreadyReturnedQuantity + quantity > orderedQuantity) {
            res.status(400).json({
                error: true,
                message: `You have already returned ${alreadyReturnedQuantity} items. You can only return ${orderedQuantity - alreadyReturnedQuantity} more.`,
                data: null
            });
            return;
        }

        const returnRequest = await requestReturn(order_items_id, return_reason);
        if (!returnRequest) {
            res.status(400).json({ error: true, message: "Return request failed.", data: null });
            return;
        }

        await addReturnItemDetails(returnRequest.data.item_return_id, order_items_id, quantity);

        res.status(200).json({
            error: false,
            message: "Return request placed successfully, waiting for admin approval.",
            data: returnRequest
        });

    } catch (err) {
        console.error("Error processing return:", err);
        res.status(500).json({ error: true, message: "Error processing return", data: err });
    }
};

export const approveReturn = async (req: Request, res: Response): Promise<void> => {
    try {
        const { return_items_id } = req.body;

        const refundAmount = await calculateRefundAmount(return_items_id);
        if (!refundAmount) {
            res.status(400).json({ error: true, message: "Refund calculation failed.", data: null });
            return;
        }

        // Approving the return and store refund amount in item_return
        const isApproved = await approveReturnRequest(return_items_id, refundAmount);
        if (!isApproved) {
            res.status(400).json({ error: true, message: "Return approval failed.", data: null });
            return;
        }

        await updateStockAfterReturn(return_items_id);

        res.status(200).json({
            error: false,
            message: "Return request approved. Refund processed.",
            data: { refundAmount }
        });

    } catch (err) {
        console.error("Error approving return:", err);
        res.status(500).json({ error: true, message: "Error approving return", data: err });
    }
};

export const getUserReturnHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;

        const returnedItems = await getUserReturnedItems(userId);

        if (returnedItems.data.length === 0) {
            res.status(404).json({ error: true, message: "No return history found.", data: null });
            return;
        }

        res.status(200).json({ error: false, message: "Returned items fetched successfully", data: returnedItems });

    } catch (err) {
        console.error("Error fetching return history:", err);
        res.status(500).json({ error: true, message: "Error fetching return history", data: err });
    }
};
