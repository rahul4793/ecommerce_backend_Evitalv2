import { Request, Response } from 'express';
import { OrderModel } from '../models/orderModel';
import { successResponse, errorResponse } from '../helpers/responseHelper';

const objOrder = new OrderModel();

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const { discount_id, address_id, cart_items } = req.body; // cart_items is an array of cart_items_id
         console.log(cart_items)
        if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
            res.status(400).json(errorResponse("No cart items provided for order",null));
        }
        const orderResult = await objOrder.createOrder(userId, discount_id, address_id, cart_items);
        res.status(orderResult.error ? 400 : 201).json(orderResult);
    } catch (err) {
        console.error("Error in createOrder:", err);
        res.status(500).json(errorResponse("Error creating order",null));
    }
};

// Get User Orders
export const getUserOrders = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;
    const orders = await objOrder.getUserOrders(userId);
    res.status(200).json(successResponse("Orders fetched",orders.data ));
};

//Get All Orders 
export const getAllOrders = async (req: Request, res: Response) => {
    const orders = await objOrder.getAllOrders();
    res.status(200).json(successResponse("All orders fetched",orders.data ));
};

// Only admin can change order status
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { order_id, status } = req.body;
        const result = await objOrder.updateOrderStatusDB(order_id, status);
        res.status(result.error ? 400 : 200).json(result);
    } catch (err) {
        res.status(500).json(errorResponse("Error updating order status",err));
    }
};

// Cancel Order (Admin/User)
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const isAdmin = (req as any).user?.role === 1;
        const { order_id } = req.body;

        const result = await objOrder.cancelOrderDB(userId, order_id, isAdmin);
        res.status(result.error ? 400 : 200).json(result);
        
    } catch (err) {
        res.status(500).json(errorResponse("Error canceling order",err));
    }
};

// GET users order details
export const getOrderDetailsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const { orders_id } = req.body;
        const result = await objOrder.getOrderDetailsById(userId, orders_id);
        res.status(result.error ? 400 : 200).json(result);
    } catch (err) {
        console.error("Error fetching order details:", err);
        res.status(500).json(errorResponse("ErrError fetching order detailsr",err));
    }
};

