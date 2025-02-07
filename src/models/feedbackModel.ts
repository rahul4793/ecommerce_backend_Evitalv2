import pool from '../config/db';

interface Feedback {
    ratings: number;
    products_id: number;
    users_id: number;
    created_at: string;
}

interface ServiceResponse {
    error: boolean;
    message: string;
    data: Feedback | Feedback[] | null | unknown;
}

// Get feedbacks for a product
export const getFeedbacks = async (id: number): Promise<ServiceResponse> => {
    try {
        const result = await pool.query(
            `SELECT f.ratings, u.first_name, u.last_name, f.created_at
             FROM feedback f
             JOIN users u ON f.users_id = u.users_id
             WHERE f.products_id = $1`, 
            [id]
        );

        return {
            error: false,
            message: result.rows.length ? "Feedback retrieved successfully" : "No feedback available",
            data: result.rows
        };
    } catch (err) {
        return {
            error: true,
            message: "Error fetching feedbacks",
            data: err
        };
    }
};

// Check if user has purchased a product
export const hasUserPurchasedProduct = async (userId: number, productId: number): Promise<ServiceResponse> => {
    try {
        const result = await pool.query(
            `SELECT 1 FROM order_items oi
             JOIN orders o ON oi.orders_id = o.orders_id
             WHERE o.users_id = $1 AND oi.products_id = $2`,
            [userId, productId]
        );

        return {
            error: false,
            message: result.rows.length > 0 ? "User has purchased the product" : "User has not purchased the product",
            data: result.rows.length > 0
        };
    } catch (err) {
        return {
            error: true,
            message: "Error checking if user has purchased the product",
            data: err
        };
    }
};

// Add feedback and update the product's average rating
export const addFeedback = async (ratings: number, products_id: number, users_id: number): Promise<ServiceResponse> => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const result = await client.query(
            `INSERT INTO feedback (ratings, products_id, users_id, created_at)
             VALUES ($1, $2, $3, NOW()) RETURNING *`,
            [ratings, products_id, users_id]
        );

        await client.query(
            `UPDATE products 
             SET average_rating = (
                 SELECT AVG(ratings) FROM feedback WHERE products_id = $1
             ) 
             WHERE products_id = $1`,
            [products_id]
        );

        await client.query("COMMIT");

        return {
            error: false,
            message: "Feedback added successfully",
            data: result.rows[0]
        };
    } catch (err) {
        await client.query("ROLLBACK");

        return {
            error: true,
            message: "Error adding feedback",
            data: err
        };
    } finally {
        client.release();
    }
};
