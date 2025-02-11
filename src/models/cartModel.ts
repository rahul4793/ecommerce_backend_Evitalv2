import pool from '../config/db';
interface ServiceResponse<T = any> {
    error: boolean;
    message: string;
    data: T | null;
}
import { successResponse, errorResponse } from '../helpers/responseHelper';
export class cartModel{

// Get cart ID by user
async getCartIdByUser (userId: number)  {
    try {
        const result = await pool.query(
            `SELECT carts_id FROM carts WHERE users_id = $1`,
            [userId]
        );
        return result.rows.length 
            ? { error: false, message: "Cart details",data: result.rows[0].carts_id }
            : { error: true, message: "Database error fetching cart",data: null };
    } catch (error) {
        return errorResponse("Database error fetching cart", error);
    }
};

// Create a cart for a user
async createCartForUser (userId: number)  {
    try {
        const result = await pool.query(
            `INSERT INTO carts (users_id) VALUES ($1) RETURNING carts_id`,
            [userId]
        );
        return successResponse("Cart created", result.rows[0].carts_id);
    } catch (error) {
        return errorResponse("Database error creating cart", error);
    }
};

// Get all cart items for a cart
async getCartItemsByCartId (cartId: number)  {
    try {
        const result = await pool.query(
            `SELECT * FROM cart_items WHERE carts_id = $1`,
            [cartId]
        );
        return {data:result.rows };
    } catch (error) {
        return { error: true, message: "Database error fetching cart items", data: error };
    }
};

async getCartDetails  (userId: number): Promise<ServiceResponse<any>> {
    try {
        let cartResult = await this.getCartIdByUser(userId);

        if (cartResult.error) {
            cartResult = await this.createCartForUser(userId);
            if (cartResult.error) { 
                return cartResult; 
            }
        }
        const itemsResult = await this.getCartItemsByCartId(cartResult.data);
        if(itemsResult.error) return itemsResult; 
        return successResponse("Cart details retrieved", itemsResult.data);
    } catch (error) {
        console.error("Error in getCartDetails model:", error);
        return errorResponse("Error fetching cart", error);
    }
};


// Add an item to the cart
async addItemToCartDB  (cartId: number, productId: number, quantity: number)  {
    try {
        const result = await pool.query(
            `INSERT INTO cart_items (carts_id, products_id, quantity) 
             VALUES ($1, $2, $3) RETURNING *`,
            [cartId, productId, quantity]
        );
        return successResponse("Item added to cart", result.rows[0] );
    } catch (error) {
        return errorResponse("Database error adding item to cart", error );
    }
};

// Update an item in the cart
async updateCartItemDB (userId: number, itemId: number, quantity: number)  {
    try {
        const result = await pool.query(
            `UPDATE cart_items SET quantity = $1 
             WHERE cart_items_id = $2 AND carts_id = (SELECT carts_id FROM carts WHERE users_id = $3) 
             RETURNING *`,
            [quantity, itemId, userId]
        );

        return result.rows.length 
            ? { error: false, message: "Cart item updated", data: result.rows[0] }
            : { error: true, message: "Cart item not found or unauthorized", data: null };
    } catch (error) {
        return errorResponse("Database error updating cart item", error );
    }
};

// Remove an item from the cart
async removeCartItemDB  (userId: number, itemId: number) {
    try {
        const result = await pool.query(
            `DELETE FROM cart_items WHERE cart_items_id = $1 
             AND carts_id = (SELECT carts_id FROM carts WHERE users_id = $2) returning *`,
            [itemId, userId]
        );
        return result.rows.length > 0
            ? { error: false, message: "Cart item removed", data: null }
            : { error: true, message: "Cart item not found or unauthorized", data: null };
    } catch (error) {
        return errorResponse("Database error removing cart item", error );
    }
};

// Clear the user's cart
async clearCartDB  (userId: number){
    try {
        await pool.query(
            `DELETE FROM cart_items WHERE carts_id = (SELECT carts_id FROM carts WHERE users_id = $1)`,
            [userId]
        );
        return successResponse("Cart cleared successfully", null );
    } catch (error) {
        return errorResponse("Database error clearing cart", error );
    }
};

async addItemToCart (userId: number, productId: number, quantity: number): Promise<ServiceResponse>  {
    try {
        if (!productId || !quantity || quantity <= 0) {
            return errorResponse("Product ID and valid quantity are required", null );
        }
        let cartResult = await this.getCartIdByUser(userId);
        if (cartResult.error) {
            cartResult = await this.createCartForUser(userId);
            if (cartResult.error) {
                return cartResult; 
            }
        }

        const cartItemResult = await this.addItemToCartDB(cartResult.data, productId, quantity);
        return cartItemResult; 

    } catch (error) {
        return errorResponse("Error adding item to cart", null );
    }
};
}