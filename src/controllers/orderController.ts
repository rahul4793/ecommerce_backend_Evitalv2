import { Request, Response } from 'express';
import { OrderModel } from '../models/orderModel';
import { successResponse, errorResponse } from '../helpers/responseHelper';

const objOrder = new OrderModel();
import { helper } from '../helpers/responseHelper';

const objHelper  =  new helper();
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const { discount_id, address_id, cart_items } = req.body; 
        const orderResult = await objOrder.createOrder(userId, discount_id, address_id, cart_items);
        if(orderResult.error){
            objHelper.error(res, 400, orderResult.message);
        }
        objHelper.success(res, orderResult.message, orderResult.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
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
        if(result.error){
            objHelper.error(res, 400, result.message);
        }
        objHelper.success(res, result.message, result.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};

// Cancel Order (Admin/User)
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const isAdmin = (req as any).user?.role === 1;
        const { order_id } = req.body;

        const result = await objOrder.cancelOrderDB(userId, order_id, isAdmin);
        if(result.error){
            objHelper.error(res, 400, result.message);
        }
        objHelper.success(res, result.message, result.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};


// GET users order details
export const getOrderDetailsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const { orders_id } = req.body;
        const result = await objOrder.getOrderDetailsById(userId, orders_id);
        if(result.error){
            objHelper.error(res, 400, result.message);
        }
        objHelper.success(res, result.message, result.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};

