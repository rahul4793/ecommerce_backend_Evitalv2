import pool from '../config/db';

// to check availability
export const getProductStock = async (productId: number) => {
    const result = await pool.query(`SELECT stock_quantity FROM products WHERE products_id = $1`, [productId]);
    return result.rows[0]?.stock_quantity || 0;
};

// Get Discount Details Percentage
export const getDiscountDetails = async (discountId: number) => {
    const result = await pool.query(`SELECT * FROM discounts WHERE discounts_id = $1`, [discountId]);
    return result.rows[0] || null;
};

export const getProductDetails = async (productId: number) => {
    const result = await pool.query(
        `SELECT product_name, price, stock_quantity FROM products WHERE products_id = $1`, 
        [productId]
    );
    return result.rows[0]; 
};

// Add Items to Order
export const addItemToOrderDB = async (orderId: number, items: any[]) => {
    for (const item of items) {
        await pool.query(
            `INSERT INTO order_items (orders_id, products_id, product_name, price, quantity, total_amount) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [orderId, item.product_id, item.product_name, item.price, item.quantity, item.price * item.quantity]
        );
    }
};

export const getUserOrdersDB = async (userId: number) => {
    const result = await pool.query(`SELECT * FROM orders o LEFT JOIN order_items oi ON o.orders_id = oi.orders_id WHERE users_id = $1`, [userId]);
    return result.rows;
};

// Get All Orders only admin
export const getAllOrdersDB = async () => {
    const result = await pool.query(`SELECT * FROM orders`);
    return result.rows;
};

// Update Order Status
export const updateOrderStatusDB = async (orderId: number, status: number) => {
    const result = await pool.query(
        `UPDATE orders SET status = $1 WHERE orders_id = $2 RETURNING *`,
        [status, orderId]
    );
    return result.rows[0];
};

// Cancel Order both
export const cancelOrderDB = async (userId: number, orderId: number, isAdmin: boolean) => {
    const result = await pool.query(
        `UPDATE orders SET status = 5 WHERE orders_id = $1 AND (users_id = $2 OR $3) AND status < 3 RETURNING *`,
        [orderId, userId, isAdmin]
    );
    return result.rowCount !== null && result.rowCount > 0;
};

// Get User Address by ID
export const getUserAddressById = async (userId: number, addressId: number) => {
    const result = await pool.query(
        `SELECT addresses_id FROM addresses WHERE users_id = $1 AND addresses_id = $2 LIMIT 1`,
        [userId, addressId]
    );
    return result.rows[0] || null;
};

// Get Default User Address
export const getUserDefaultAddress = async (userId: number) => {
    const result = await pool.query(
        `SELECT addresses_id FROM addresses WHERE users_id = $1 AND is_default = TRUE LIMIT 1`,
        [userId]
    );
    return result.rows[0] || null;
};

// Create Order in `orders` Table
export const createOrderDB = async (userId: number, addressId: number, discountId: number | null, totalAmount: number, discountAmount: number, netAmount: number, shippingAmount: number) => {
    const result = await pool.query(
        `INSERT INTO orders (users_id, addresses_id, discounts_id, total_amount, discount_amount, net_amount, shipping_amount, status, payment_status, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, 1, 0, NOW()) RETURNING *`,
        [userId, addressId, discountId, totalAmount, discountAmount, netAmount, shippingAmount]
    );
    return result.rows[0];
};

// Insert Order Items into `order_items` Table
export const addItemsToOrderDB = async (orderId: number, items: any[]) => {
    const values = items.map(item => `(${orderId}, ${item.product_id}, '${item.product_name}', ${item.price}, ${item.quantity}, ${item.total_amount})`).join(',');

    const query = `INSERT INTO order_items (orders_id, products_id, product_name, price, quantity, total_amount) VALUES ${values} RETURNING *`;

    const result = await pool.query(query);
    return result.rows;
};

// Calculate Final Order Total with Discount
export const calculateOrderTotal = async (totalAmount: number, discountId: number | null) => {
    let discountAmount = 0, shippingAmount = 5.00;

    if (discountId) {
        const discount = await pool.query(`SELECT discount_type, discount_value FROM discounts WHERE discounts_id = $1`, [discountId]);
        if (discount && discount.rowCount && discount.rowCount > 0) {  
            const { discount_type, discount_value } = discount.rows[0];
            discountAmount = discount_type === 1 ? discount_value : (totalAmount * discount_value) / 100;
        }
    }

    return { totalAmount, discountAmount, netAmount: totalAmount - discountAmount, shippingAmount };
};

// Update Product Stock
export const updateProductStock = async (productId: number, quantityOrdered: number) => {
    const result = await pool.query(
        `UPDATE products 
         SET stock_quantity = stock_quantity - $1 
         WHERE products_id = $2 AND stock_quantity >= $1 
         RETURNING stock_quantity`,
        [quantityOrdered, productId]
    );

    if (result.rowCount === 0) {
        throw new Error(`Stock update failed for product ID ${productId}`);
    }

    return result.rows[0];
};
