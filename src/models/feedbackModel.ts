import pool from '../config/db';
import { successResponse, errorResponse } from '../helpers/responseHelper';

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
export class feedbackModel {

// Get feedbacks for a product
async getFeedbacks  (id: number): Promise<ServiceResponse>  {
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
        return errorResponse("Error fetching feedbacks", err);
    }
};

// Check if user has purchased a product
async hasUserPurchasedProduct  (userId: number, productId: number) {
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
        return errorResponse("Error checking if user has purchased the product", err);
    }
};

// Add feedback and update the product's average rating
async addFeedback  (ratings: number, products_id: number, users_id: number) {
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
        return errorResponse("Feedback added successfully", result.rows[0]);
    } catch (err) {
        await client.query("ROLLBACK");
        return errorResponse("Error adding feedback",err);
    } finally {
        client.release();
    }
};

}