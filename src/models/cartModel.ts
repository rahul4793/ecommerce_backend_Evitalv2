import pool from '../config/db';

// Get cart ID by user
export const getCartIdByUser = async (userId: number) => {
    try {
        const result = await pool.query(
            `SELECT carts_id FROM carts WHERE users_id = $1`,
            [userId]
        );

        return result.rows.length 
            ? { error: false, message: "Cart details",data: result.rows[0].carts_id }
            : { error: true, message: "Database error fetching cart",data: null };
    } catch (error) {
        return { error: true, message: "Database error fetching cart", data: error };
    }
};

// Create a cart for a user
export const createCartForUser = async (userId: number) => {
    try {
        const result = await pool.query(
            `INSERT INTO carts (users_id) VALUES ($1) RETURNING carts_id`,
            [userId]
        );
        return { error: false, message: "Cart created", data: result.rows[0].carts_id };
    } catch (error) {
        return { error: true, message: "Database error creating cart", data: error };
    }
};

// Get all cart items for a cart
export const getCartItemsByCartId = async (cartId: number) => {
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

// Add an item to the cart
export const addItemToCartDB = async (cartId: number, productId: number, quantity: number) => {
    try {
        const result = await pool.query(
            `INSERT INTO cart_items (carts_id, products_id, quantity) 
             VALUES ($1, $2, $3) RETURNING *`,
            [cartId, productId, quantity]
        );
        return { error: false, message: "Item added to cart", data: result.rows[0] };
    } catch (error) {
        return { error: true, message: "Database error adding item to cart", data: error };
    }
};

// Update an item in the cart
export const updateCartItemDB = async (userId: number, itemId: number, quantity: number) => {
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
        return { error: true, message: "Database error updating cart item", data: error };
    }
};

// Remove an item from the cart
export const removeCartItemDB = async (userId: number, itemId: number) => {
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
        return { error: true, message: "Database error removing cart item", data: error };
    }
};

// Clear the user's cart
export const clearCartDB = async (userId: number) => {
    try {
        await pool.query(
            `DELETE FROM cart_items WHERE carts_id = (SELECT carts_id FROM carts WHERE users_id = $1)`,
            [userId]
        );
        return { error: false, message: "Cart cleared successfully", data: null };
    } catch (error) {
        return { error: true, message: "Database error clearing cart", data: error };
    }
};
