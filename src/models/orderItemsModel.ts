import pool from '../config/db';
import { successResponse, errorResponse, ServiceResponse } from '../helpers/responseHelper';
import { db } from './db';

export class orderItemsModel extends db{
    constructor() {
        super();
        this.table = 'order_items'; 
        this.uniqueField = 'order_items_id';
    }
       async addItemsToOrder(client: any, orderId: number, items: any[]) {
        try {
            const values = items.map(item => `(${orderId}, ${item.products_id}, '${item.product_name}', ${item.price}, ${item.quantity}, ${item.total_amount})`).join(',');
                const columns = "(orders_id, products_id, product_name, price, quantity, total_amount)";
            const query = `INSERT INTO ${this.table} ${columns} VALUES ${values} RETURNING *`;
                const result = await client.query(query);
            return successResponse("Added to order", result.rows); 
    
        } catch (error) {
            console.error("Error adding items to order:", error);
            return errorResponse("Database error adding items to order", error);
        }
    }
    async getOrderedQuantity(orderItemId: number) {
        try {
            const whereCondition = `WHERE order_items_id = ${orderItemId}`;
            const orderItem = await this.select("order_items", "quantity", whereCondition, "", "LIMIT 1");
            return orderItem.rows[0]?.quantity || 0;
        } catch (err) {
            return errorResponse("Error getting order quantity", err);
        }
    }
    
    async checkUserOrderStatus(userId: number, orderItemId: number) {
        try {
            const whereCondition = `WHERE order_items_id = ${orderItemId} 
                                    AND orders_id IN (SELECT id FROM orders WHERE users_id = ${userId} AND status = 1)`;
            const order = await this.select("order_items", "*", whereCondition, "", "LIMIT 1");
            return order.rows.length > 0;
        } catch (err) {
        return errorResponse("Error checking details", err);
        }
    }

}