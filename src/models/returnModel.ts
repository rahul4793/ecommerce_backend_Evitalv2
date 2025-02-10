import pool from '../config/db';

interface ServiceResponse {
    error: boolean;
    message: string;
    data: any;
}


export class returnModel {


// Check if user has ordered this product and order is in status 1 meaning placed
async checkUserOrderStatus (userId: number, orderItemId: number) {
    const result = await pool.query(
        `SELECT 1 FROM order_items oi                                       
         JOIN orders o ON oi.orders_id = o.orders_id
         WHERE o.users_id = $1 AND oi.order_items_id = $2 AND o.status = 1`,
        [userId, orderItemId]
    );
    return result.rows.length > 0;
};

// Insert return request into item_return
async requestReturn  (orderItemId: number, returnReason: string): Promise<ServiceResponse>  {
    try {
        const result = await pool.query(
            `INSERT INTO item_return (order_items_id, return_reason, return_status, return_date, created_at)
             VALUES ($1, $2, 1, NOW(), NOW()) RETURNING *`,
            [orderItemId, returnReason]
        );
        return { error: false, message: "Return request placed", data: result.rows[0] };
    } catch (err) {
        return { error: true, message: "Error placing return request", data: err };
    }
};

async processReturnRequest  (userId: number, orderItemId: number, quantity: number, returnReason: string): Promise<ServiceResponse>  {
    try {
        const orderValid = await this.checkUserOrderStatus(userId, orderItemId);
        if (!orderValid) {
            return { error: true, message: "You can only return items from your placed orders.", data: null };
        }
        const orderedQuantity = await this.getOrderedQuantity(orderItemId);
        const alreadyReturnedQuantity = await this.getReturnedQuantity(orderItemId);
        if (alreadyReturnedQuantity + quantity > orderedQuantity) {
            return {
                error: true,
                message: `You have already returned ${alreadyReturnedQuantity} items. You can only return ${orderedQuantity - alreadyReturnedQuantity} more.`,
                data: null
            };
        }
        const returnRequest = await this.requestReturn(orderItemId, returnReason);
        if (returnRequest.error) {
            return returnRequest; 
        }
        const returnItemDetails = await this.addReturnItemDetails(returnRequest.data.item_return_id, orderItemId, quantity);
        if (returnItemDetails.error) {
            return returnItemDetails; 
        }
        return {
            error: false,
            message: "Return request placed successfully, waiting for admin approval.",
            data: returnRequest.data
        };
    } catch (error) {
        console.error("Error processing return request in model:", error);
        return { error: true, message: "Error processing return", data: null };
    }
};


// Insert return details into return_item_details
async addReturnItemDetails  (returnItemId: number, orderItemId: number, quantity: number): Promise<ServiceResponse> {
    try {
        const result = await pool.query(
            `INSERT INTO return_item_details (returns_id, order_items_id, products_id, quantity, price, return_status, return_date, created_at)
             SELECT $1, $2, products_id, $3, price, 1, NOW(), NOW() 
             FROM order_items WHERE order_items_id = $2 RETURNING *`,
            [returnItemId, orderItemId, quantity]
        );
        return { error: false, message: "Return item details added", data: result.rows[0] };
    } catch (err) {
        return { error: true, message: "Error adding return item details", data: err };
    }
};

// Approve return & update refund in item_return
async approveReturnRequest  (returnItemId: number, refundAmount: number): Promise<boolean>  {
    try {
        const result = await pool.query(
            `UPDATE item_return 
             SET return_status = 2, total_amount = $2, updated_at = NOW()
             WHERE item_return_id = $1 RETURNING *`,
            [returnItemId, refundAmount]
        );

        if (result.rows.length > 0) {
            await pool.query(
                `UPDATE return_item_details 
                 SET return_status = 2, updated_at = NOW() 
                 WHERE returns_id = $1`,
                [returnItemId]
            );
            return true;
        }
        return false;
    } catch (err) {
        return false;
    }
};

// Calculate refund amount
async calculateRefundAmount  (returnItemId: number): Promise<number>{
    try {
        const result = await pool.query(
            `SELECT SUM(price * quantity) AS refund_amount 
             FROM return_item_details WHERE returns_id = $1`,
            [returnItemId]
        );
        return result.rows[0]?.refund_amount || 0;
    } catch (err) {
        return 0;
    }
};




async processReturnApproval  (returnItemId: number): Promise<ServiceResponse> {
    try {
        const refundAmount = await this.calculateRefundAmount(returnItemId);
        if (refundAmount === 0) { // Or if (!refundAmount) if you want to treat 0 as an error too
            return { error: true, message: "Refund calculation failed.", data: null };
        }

        const isApproved = await this.approveReturnRequest(returnItemId, refundAmount);
        if (!isApproved) {
            return { error: true, message: "Return approval failed.", data: null };
        }

        await this.updateStockAfterReturn(returnItemId);

        return {
            error: false,
            message: "Return request approved. Refund processed.",
            data: { refundAmount }
        };

    } catch (error) {
        console.error("Error processing return approval in model:", error);
        return { error: true, message: "Error approving return", data: null };
    }
};






// Update stock after return approval
async updateStockAfterReturn (returnItemId: number): Promise<void> {
    await pool.query(
        `UPDATE products 
         SET stock_quantity = stock_quantity + (SELECT SUM(quantity) FROM return_item_details WHERE returns_id = $1)
         WHERE products_id IN (SELECT products_id FROM return_item_details WHERE returns_id = $1)`,
        [returnItemId]
    );
};

// Get Ordered Quantity from order_items
async getOrderedQuantity  (orderItemId: number): Promise<number>  {
    const result = await pool.query(
        `SELECT quantity FROM order_items WHERE order_items_id = $1`,
        [orderItemId]
    );
    return result.rows[0]?.quantity || 0;
};

// Get Already Returned Quantity from return_item_details table
async getReturnedQuantity  (orderItemId: number): Promise<number>  {
    const result = await pool.query(
        `SELECT COALESCE(SUM(quantity), 0) AS returned_quantity 
         FROM return_item_details 
         WHERE order_items_id = $1 AND return_status != 3`,//excluding rejected item 3
        [orderItemId]
    );
    return result.rows[0]?.returned_quantity || 0;
};

async getUserReturnedItems  (userId: number): Promise<ServiceResponse>  {
    try {
        const result = await pool.query(
    `SELECT 
    rid.Return_items_Id, 
    p.Product_name, 
    rid.Quantity, 
    rid.Return_status, 
    (rid.Quantity * rid.Price) AS Total_amount
FROM Return_item_details rid
JOIN Products p ON rid.Products_Id = p.Products_Id
JOIN Order_items oi ON rid.Order_items_Id = oi.Order_items_Id
JOIN Orders o ON oi.Orders_Id = o.Orders_Id
WHERE o.Users_Id = $1;
`,[userId]
        );
        return { error: false, message: "Returned items fetched", data: result.rows };
    } catch (err) {
        return { error: true, message: "Error fetching returned items", data: err };
    }
};
}