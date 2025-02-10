import { Request, Response } from 'express';
import { cartModel } from '../models/cartModel';
import { successResponse, errorResponse } from '../helpers/responseHelper';

const cartObj = new cartModel();


export const getCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const cartDetails = await cartObj.getCartDetails(userId);
        res.status(cartDetails.error ? (cartDetails.message === "No cart found for user" ? 404 : 500) : 200).json(cartDetails); 
    } catch (err) {
        console.error("Error in getCart controller:", err);
        res.status(500).json(errorResponse("Error fetching cart",{}));
    }
};

export const addToCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { product_id, quantity } = req.body;

        const cartItemResult = await cartObj.addItemToCart(userId, product_id, quantity);
        res.status(cartItemResult.error ? (cartItemResult.message === "Product ID and valid quantity are required." ? 400 : 500) : 201).json(cartItemResult); // Conditional status code

    } catch (err) {
        console.error("Error in addToCart controller:", err);
        res.status(500).json(errorResponse("Error adding item to cart",{}));
    }
};

// Update a cart item
export const updateCartItem = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const itemId = Number(req.params.itemId);
        const { quantity } = req.body;
        const updateResult = await cartObj.updateCartItemDB(userId, itemId, quantity);
        res.status(updateResult.error ? 404 : 200).json(updateResult);
    } catch (err) {
        res.status(500).json({ error: true, message: "Error updating cart item", data: err });
    }
};


// Remove a cart item
export const removeCartItem = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const itemId = Number(req.params.itemId);
        const deleteResult = await cartObj.removeCartItemDB(userId, itemId);
        res.status(deleteResult.error ? 404 : 200).json(deleteResult);
    } catch (err) {
        res.status(500).json({ error: true, message: "Error removing cart item", data: err });
    }
};

// Clear the user's cart
export const clearCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const clearResult = await cartObj.clearCartDB(userId);
        res.status(clearResult.error ? 500 : 200).json(clearResult);
    } catch (err) {
        res.status(500).json({ error: true, message: "Error clearing cart", data: err });
    }
};
