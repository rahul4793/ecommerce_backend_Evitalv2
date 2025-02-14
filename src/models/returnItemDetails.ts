import pool from "../config/db";
import { errorResponse, ServiceResponse, successResponse } from "../helpers/responseHelper";
import { db } from "./db";

export class returnItemDetails extends db{

    public table: string = 'return_item_details';
    public uniqueField: string = 'return_items_id';
    constructor() {
        super(); 
    }
    async addReturnItemDetails(returnItemId: number, orderItemId: number, quantity: number): Promise<ServiceResponse> {
        try {
            this.where = `where order_items_id = ${orderItemId}`;
            const orderItem = await this.allRecords('*'); // Get all fields to access products_id and price
    
            if (!orderItem || orderItem.length === 0) {
                return errorResponse("Order item not found", null); 
            }
            const product_id = orderItem[0].products_id;
            const price = orderItem[0].price;
    
            const returnDetails = {
                returns_id: returnItemId,
                order_items_id: orderItemId,
                products_id: product_id,
                quantity: quantity,
                price: price,
                return_status: 1,
            };
            const result = await this.insertRecord(returnDetails);
            return successResponse("Return item details added", result); 
        } catch (err) {
            console.error("Error adding return item details:", err); 
            return errorResponse("Error adding return item details", err);
        }
    };

  ////////////////////////////////chnages make from  here
  async calculateRefundAmount  (returnItemId: number): Promise<number>{
    try {
        const result = await this.selectRecord(returnItemId,"SUM(price * quantity) AS refund_amount")
        // const result = await pool.query(
        //     `SELECT SUM(price * quantity) AS refund_amount 
        //      FROM return_item_details WHERE returns_id = $1`,
        //     [returnItemId]
        // );
        return result.rows[0]?.refund_amount || 0;
    } catch (err) {
        return 0;
    }
};

async updateStockAfterReturn (returnItemId: number): Promise<void> {
    await pool.query(
        `UPDATE products 
         SET stock_quantity = stock_quantity + (SELECT SUM(quantity) FROM return_item_details WHERE returns_id = $1)
         WHERE products_id IN (SELECT products_id FROM return_item_details WHERE returns_id = $1)`,
        [returnItemId]
    );
};

async getReturnedQuantity  (orderItemId: number): Promise<number>  {
    this.where = `WHERE order_items_id = ${orderItemId} AND return_status != 3`;
    let result = await this.listRecords("COALESCE(SUM(quantity), 0) AS returned_quantity")
    // const result = await pool.query(
    //     `SELECT COALESCE(SUM(quantity), 0) AS returned_quantity 
    //      FROM return_item_details 
    //      WHERE order_items_id = $1 AND return_status != 3`,
    //     [orderItemId]
    // );
    return result.rows[0]?.returned_quantity || 0;
};


}