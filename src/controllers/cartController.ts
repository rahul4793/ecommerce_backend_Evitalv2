import { Request, Response } from 'express';
import { 
    getCartIdByUser, 
    createCartForUser, 
    getCartItemsByCartId, 
    addItemToCartDB, 
    updateCartItemDB, 
    removeCartItemDB, 
    clearCartDB 
} from '../models/cartModel';

// Get the user's 



export const getCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;

        let cartResult = await getCartIdByUser(userId);
        
        if (cartResult.error) {
            cartResult = await createCartForUser(userId);
        }

        const itemsResult = await getCartItemsByCartId(cartResult.data);
        res.status(itemsResult.error ? 500 : 200).json({error:false,message:"Got details",data:itemsResult.data});
    } catch (err) {
        res.status(500).json({ error: true, message: "Error fetching cart", data: err });
    }
};

// Add an item to the cart
export const addToCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { product_id, quantity } = req.body;

        if (!product_id || !quantity || quantity <= 0) {
             res.status(400).json({ error: true, message: "Product ID and valid quantity are required." }); return
        }

        let cartResult = await getCartIdByUser(userId);
        if (cartResult.error) {
            cartResult = await createCartForUser(userId);
        }

        const cartItemResult = await addItemToCartDB(cartResult.data, product_id, quantity);
        res.status(cartItemResult.error ? 500 : 201).json(cartItemResult);
    } catch (err) {
        res.status(500).json({ error: true, message: "Error adding item to cart", data: err });
    }
};

// Update a cart item
export const updateCartItem = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const itemId = Number(req.params.itemId);
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
             res.status(400).json({ error: true, message: "Quantity must be greater than zero." });  return
        }

        const updateResult = await updateCartItemDB(userId, itemId, quantity);
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

        const deleteResult = await removeCartItemDB(userId, itemId);
        res.status(deleteResult.error ? 404 : 200).json(deleteResult);
    } catch (err) {
        res.status(500).json({ error: true, message: "Error removing cart item", data: err });
    }
};

// Clear the user's cart
export const clearCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const clearResult = await clearCartDB(userId);
        res.status(clearResult.error ? 500 : 200).json(clearResult);
    } catch (err) {
        res.status(500).json({ error: true, message: "Error clearing cart", data: err });
    }
};
