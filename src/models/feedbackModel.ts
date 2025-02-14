import { db } from './db';
import { successResponse, errorResponse, ServiceResponse } from '../helpers/responseHelper';
import pool from '../config/db';
import { productModel } from './productModel';



// const objFeed = new feedbackModel();
interface Feedback {
    ratings: number;
    products_id: number;
    users_id: number;
    created_at: string;
}

export class feedbackModel extends db {
    constructor() {
        super();
        this.table = 'feedback'; 
        this.uniqueField = 'feedback_id';
    }

    async getFeedbacks(id: number) {
        try {
            const query = `
                SELECT f.ratings, u.first_name, u.last_name, f.created_at
                FROM feedback f
                JOIN users u ON f.users_id = u.users_id
                WHERE f.products_id = ${id}`;
            const result = await this.executeQuery(query);
            return result && result.length > 0
                ? successResponse("Feedback retrieved successfully", result)
                : errorResponse("No feedback available", null);
        } catch (err) {
            return errorResponse("Error fetching feedbacks", err);
        }
    };

    async hasUserPurchasedProduct(userId: number, productId: number) {
        try {
            const query = `
                SELECT 1 FROM order_items oi
                JOIN orders o ON oi.orders_id = o.orders_id
                WHERE o.users_id = ${userId} AND oi.products_id = ${productId}`;
            const result = await this.executeQuery(query);
            const hasPurchased = result && result.length > 0;
            return successResponse(hasPurchased ? "User has purchased the product" : "User has not purchased the product", hasPurchased);
        } catch (err) {
            return errorResponse("Error checking if user has purchased the product", err);
        }
    };

    async addFeedback(ratings: number, products_id: number, users_id: number) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const feedbackData = { ratings, products_id, users_id}; 
            this.table = 'feedback';
            const insertedFeedback = await this.insertRecord(feedbackData);
            // 
            await client.query(
                `UPDATE products 
                 SET average_rating = (SELECT AVG(ratings) FROM feedback WHERE products_id = $1) 
                 WHERE products_id = $1`,
                [products_id]
            );
            await client.query("COMMIT");
            this.table = 'feedback'; //reset the table
            return successResponse("Feedback added successfully", insertedFeedback);
        } catch (err) {
            await client.query("ROLLBACK");
            return errorResponse("Error adding feedback", err);
        } finally {
            client.release();
        }
    };

    async getFeedbacksProduct(id: number) {
        try {
            const query = await this.selectRecord(id,"average_rating")
            return query && query.length > 0
                ? successResponse("Average rating retrieved successfully", query)
                : errorResponse("No rating available", null);
        } catch (err) {
            return errorResponse("Error fetching feedbacks", err);
        }
    };







}