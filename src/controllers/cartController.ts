import { Request, Response } from 'express';
import { cartModel } from '../models/cartModel';
import { successResponse, errorResponse } from '../helpers/responseHelper';

import { helper } from '../helpers/responseHelper';

const objHelper  =  new helper();

const cartObj = new cartModel();


export const getCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const cartDetails = await cartObj.getCartDetails(userId);
        if(cartDetails.error){
            objHelper.error(res, 400, cartDetails.message);
        }
        objHelper.success(res, cartDetails.message, cartDetails.data);
    } catch (err) {
        console.error("Error in getCart controller:", err);
        objHelper.error(res, 500, "Server Error");
    }
};

export const addToCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { product_id, quantity } = req.body;
        const cartItemResult = await cartObj.addItemToCart(userId, product_id, quantity);
        if(cartItemResult.error){
            objHelper.error(res, 400, cartItemResult.message);
        }
        objHelper.success(res, cartItemResult.message, cartItemResult.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};


// Update a cart item
export const updateCartItem = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const itemId = Number(req.params.itemId);
        const { quantity } = req.body;
        const updateResult = await cartObj.updateCartItemDB(userId, itemId, quantity);
        if(updateResult.error){
            objHelper.error(res, 400, updateResult.message);
        }
        objHelper.success(res, updateResult.message, updateResult.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};

// Remove a cart item
export const removeCartItem = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const itemId = Number(req.params.itemId);
        const deleteResult = await cartObj.removeCartItemDB(userId, itemId);
        if(deleteResult.error){
            objHelper.error(res, 400, deleteResult.message);
        }
        objHelper.success(res, deleteResult.message, deleteResult.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};

// Clear the user's cart
export const clearCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const clearResult = await cartObj.clearCartDB(userId);
        if(clearResult.error){
            objHelper.error(res, 400, clearResult.message);
        }
        objHelper.success(res, clearResult.message, clearResult.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};