import pool from '../config/db';

interface ServiceResponse {
    error: boolean;
    message: string;
    data: any;
}

// Check if user has ordered this product and order is in status 1 meaning placed
export const checkUserOrderStatus = async (userId: number, orderItemId: number): Promise<boolean> => {
    const result = await pool.query(
        `SELECT 1 FROM order_items oi                                       
         JOIN orders o ON oi.orders_id = o.orders_id
         WHERE o.users_id = $1 AND oi.order_items_id = $2 AND o.status = 1`,
        [userId, orderItemId]
    );
    return result.rows.length > 0;
};

// Insert return request into item_return
export const requestReturn = async (orderItemId: number, returnReason: string): Promise<ServiceResponse> => {
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

// Insert return details into return_item_details
export const addReturnItemDetails = async (returnItemId: number, orderItemId: number, quantity: number): Promise<ServiceResponse> => {
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
export const approveReturnRequest = async (returnItemId: number, refundAmount: number): Promise<boolean> => {
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
export const calculateRefundAmount = async (returnItemId: number): Promise<number> => {
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

// Update stock after return approval
export const updateStockAfterReturn = async (returnItemId: number): Promise<void> => {
    await pool.query(
        `UPDATE products 
         SET stock_quantity = stock_quantity + (SELECT SUM(quantity) FROM return_item_details WHERE returns_id = $1)
         WHERE products_id IN (SELECT products_id FROM return_item_details WHERE returns_id = $1)`,
        [returnItemId]
    );
};

// Get Ordered Quantity from order_items
export const getOrderedQuantity = async (orderItemId: number): Promise<number> => {
    const result = await pool.query(
        `SELECT quantity FROM order_items WHERE order_items_id = $1`,
        [orderItemId]
    );
    return result.rows[0]?.quantity || 0;
};

// Get Already Returned Quantity from return_item_details table
export const getReturnedQuantity = async (orderItemId: number): Promise<number> => {
    const result = await pool.query(
        `SELECT COALESCE(SUM(quantity), 0) AS returned_quantity 
         FROM return_item_details 
         WHERE order_items_id = $1 AND return_status != 3`, // Exclude rejected returns because rejected returns have status 3
        [orderItemId]
    );
    return result.rows[0]?.returned_quantity || 0;
};

export const getUserReturnedItems = async (userId: number): Promise<ServiceResponse> => {
    try {
        const result = await pool.query(
            `SELECT 
                ri.return_items_id,
                p.product_name, 
                ri.quantity, 
                ri.price AS refunded_price,
                ir.return_status, 
                ir.return_date, 
                ir.total_amount AS refund_amount
            FROM return_item_details ri
            JOIN item_return ir ON ri.returns_id = ir.item_return_id
            JOIN order_items oi ON ri.order_items_id = oi.order_items_id
            JOIN orders o ON oi.orders_id = o.orders_id
            JOIN products p ON ri.products_id = p.products_id
            WHERE o.users_id = $1
            ORDER BY ir.return_date DESC`,
            [userId]
        );
        return { error: false, message: "Returned items fetched", data: result.rows };
    } catch (err) {
        return { error: true, message: "Error fetching returned items", data: err };
    }
};
