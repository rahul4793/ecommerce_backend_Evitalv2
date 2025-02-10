import pool from '../config/db';
import { successResponse, errorResponse, ServiceResponse } from '../helpers/responseHelper';


export class OrderModel {
    // Get User Address (Default or Selected)
    async getUserAddress(userId: number, addressId?: number) {
        const result = await pool.query(
            `SELECT addresses_id FROM addresses 
             WHERE users_id = $1 
             AND (addresses_id = $2 OR is_default = TRUE) 
             ORDER BY is_default DESC 
             LIMIT 1`, 
            [userId, addressId || null]
        );
        return result.rows[0] || null;
    }

    // Get Selected Cart Items by cart_items_id Array
    async getSelectedCartItems(userId: number, cartItems: number[]) {
        const result = await pool.query(
            `SELECT ci.cart_items_id, ci.products_id, ci.quantity, 
                    p.product_name, p.price, p.stock_quantity 
             FROM cart_items ci
             JOIN products p ON ci.products_id = p.products_id
             WHERE ci.cart_items_id = ANY($1) 
             AND ci.carts_id = (SELECT carts_id FROM carts WHERE users_id = $2)`,
            [cartItems, userId]
        );
        return result.rows || [];
    }

    // Create Order in Database for Selected Cart Items
    async createOrder(userId: number, discountId: number | null, addressId: number | null, cartItems: number[]) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Get User Address (either provided or default)
            const selectedAddress = addressId
                ? await this.getUserAddress(userId, addressId)
                : await this.getUserAddress(userId);
            if (!selectedAddress) {
                await client.query("ROLLBACK");
                return { error: true, message: "No valid address found", data: null };
            }

            // Fetch selected cart items
            const selectedCartItems = await this.getSelectedCartItems(userId, cartItems);
            if (!selectedCartItems.length) {
                await client.query("ROLLBACK");
                return { error: true, message: "No valid cart items found.", data: null };
            }

            let totalAmount = 0;
            const orderItems = [];

            for (const item of selectedCartItems) {
                const stockCheck = await client.query(
                    `SELECT stock_quantity FROM products WHERE products_id = $1 FOR UPDATE`, 
                    [item.products_id]
                );
                if (!stockCheck.rows.length || stockCheck.rows[0].stock_quantity < item.quantity) {
                    await client.query("ROLLBACK");
                    return { error: true, message: `Stock unavailable for ${item.product_name}`, data: null };
                }

                const itemTotal = item.price * item.quantity;
                totalAmount += itemTotal;

                orderItems.push({
                    product_id: item.products_id,
                    product_name: item.product_name,
                    price: item.price,
                    quantity: item.quantity,
                    total_amount: itemTotal,
                });
            }

            // Applying discount
            const { discountAmount, netAmount, shippingAmount } = await this.calculateOrderTotal(totalAmount, discountId);

            // Insert Order
            const result = await client.query(
                `INSERT INTO orders (users_id, addresses_id, discounts_id, total_amount, discount_amount, net_amount, shipping_amount, status, payment_status, created_at) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 1, 0, NOW()) RETURNING *`,
                [userId, selectedAddress.addresses_id, discountId, totalAmount, discountAmount, netAmount, shippingAmount]
            );

            const newOrder = result.rows[0];

            // Insert Order Items
            await this.addItemsToOrder(client, newOrder.orders_id, orderItems);

            // Update Product Stock
            for (const item of orderItems) {
                await this.updateProductStock(client, item.product_id, item.quantity);
            }

            // Remove selected cart items
            await this.removeSelectedCartItems(client, cartItems, userId);

            await client.query("COMMIT");
            return { error: false, message: "Order placed successfully!", order: newOrder, items: orderItems };
        } catch (error) {
            await client.query("ROLLBACK");
            return errorResponse("Error creating order", error);

        } finally {
            client.release();
        }
    }

    // Add Order Items to Database
    async addItemsToOrder(client: any, orderId: number, items: any[]) {
        const values = items.map(item => `(${orderId}, ${item.product_id}, '${item.product_name}', ${item.price}, ${item.quantity}, ${item.total_amount})`).join(',');
        await client.query(`INSERT INTO order_items (orders_id, products_id, product_name, price, quantity, total_amount) VALUES ${values}`);
    }

    // Remove only selected cart items after order placement
    async removeSelectedCartItems(client: any, cartItems: number[], userId: number) {
        await client.query(
            `DELETE FROM cart_items WHERE cart_items_id = ANY($1) 
             AND carts_id = (SELECT carts_id FROM carts WHERE users_id = $2)`,
            [cartItems, userId]
        );
    }

    // Update Product Stock
    async updateProductStock(client: any, productId: number, quantityOrdered: number) {
        await client.query(
            `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE products_id = $2`, 
            [quantityOrdered, productId]
        );
    }

    // Calculate Order Total with Discount
    async calculateOrderTotal(totalAmount: number, discountId: number | null) {
        let discountAmount = 0, shippingAmount = 5.00;

        if (discountId) {
            const discount = await pool.query(`SELECT discount_type, discount_value FROM discounts WHERE discounts_id = $1`, [discountId]);
            if (discount.rowCount && discount.rows.length > 0) {  
                const { discount_type, discount_value } = discount.rows[0];
                discountAmount = discount_type === 1 ? discount_value : (totalAmount * discount_value) / 100;
            }
        }

        return { totalAmount, discountAmount, netAmount: totalAmount - discountAmount, shippingAmount };
    }
// Get all orders for an admin
    async getAllOrders() {
        try {
            const result = await pool.query(
                `SELECT o.*, u.first_name, u.last_name 
                 FROM orders o
                 JOIN users u ON o.users_id = u.users_id
                 ORDER BY o.created_at DESC`
            );
            return successResponse("All orders fetched successfully", result.rows);

        } catch (error) {
            return errorResponse("Error fetching all orders", error);

        }
    }

    // Get orders for a specific user
    async getUserOrders(userId: number) {
        try {
            const result = await pool.query(
                `SELECT o.*, a.full_address 
                 FROM orders o
                 JOIN addresses a ON o.addresses_id = a.addresses_id
                 WHERE o.users_id = $1
                 ORDER BY o.created_at DESC`,
                [userId]
            );
            return successResponse("User orders fetched successfully", result.rows);
        } catch (error) {
            return errorResponse("Error fetching user orders", error);

        }
    }
    async updateOrderStatusDB(orderId: number, status: number) {
        const validStatuses = [1, 2, 3, 4, 5]; // Allow "Canceled" status

        if (!orderId || typeof orderId !== 'number' || !validStatuses.includes(status)) {
            return errorResponse("Invalid order_id or status", null);
        }

        const result = await pool.query(
            `UPDATE orders SET status = $1, updated_at = NOW() WHERE orders_id = $2 RETURNING *`,
            [status, orderId]
        );

        return result.rows.length > 0
            ? { error: false, message: "Order status updated successfully", data: result.rows[0] 
            }
            : { error: true, message: "Order not found or could not update status", data: null };
    }

    // Cancel Order (Restore Stock if Order is Canceled)
    async cancelOrderDB(userId: number, orderId: number, isAdmin: boolean) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Fetch ordered items
            const orderItems = await client.query(
                `SELECT oi.products_id, oi.quantity 
                 FROM order_items oi 
                 JOIN orders o ON oi.orders_id = o.orders_id 
                 WHERE o.orders_id = $1 AND (o.users_id = $2 OR $3) AND o.status < 3`,
                [orderId, userId, isAdmin]
            );

            if (orderItems.rows.length === 0) {
                await client.query("ROLLBACK");
                return errorResponse("Order not found or cannot be canceled",null);

            }

            // Update order status to "Canceled"
            const updateResult = await client.query(
                `UPDATE orders SET status = 5, updated_at = NOW() WHERE orders_id = $1 RETURNING *`,
                [orderId]
            );

            // Restore stock for canceled items
            await Promise.all(orderItems.rows.map(item => 
                this.restoreProductStock(client, item.products_id, item.quantity)
            ));

            await client.query("COMMIT");
            return successResponse("Order canceled successfully",updateResult.rows[0]);

        } catch (error) {
            await client.query("ROLLBACK");
            return errorResponse("Error canceling order",error);

        } finally {
            client.release();
        }
    }

    // Restore Product Stock on Order Cancellation
    async restoreProductStock(client: any, productId: number, quantity: number) {
        await client.query(
            `UPDATE products SET stock_quantity = stock_quantity + $1 WHERE products_id = $2`,
            [quantity, productId]
        );
    }

    // Get Order Details by Order ID for a User
    async getOrderDetailsById(userId: number, orderId: number) {
        if (!orderId || typeof orderId !== 'number') {
            return errorResponse("Invalid or missing order_id",null);

        }

        try {
            const client = await pool.connect();
            await client.query("BEGIN");

            // Fetch Order Details
            const orderResult = await client.query(
                `SELECT o.orders_id, o.total_amount, o.discount_amount, o.net_amount, o.shipping_amount, 
                        o.status, o.payment_status, o.created_at, a.full_address
                 FROM orders o
                 JOIN addresses a ON o.addresses_id = a.addresses_id
                 WHERE o.orders_id = $1 AND o.users_id = $2`,
                [orderId, userId]
            );

            if (orderResult.rowCount === 0) {
                await client.query("ROLLBACK");
                return errorResponse("Order not found or access denied",null);

            }

            const orderDetails = orderResult.rows[0];

            // Fetch Order Items
            const itemsResult = await client.query(
                `SELECT oi.order_items_id, oi.products_id, p.product_name, oi.quantity, oi.price, oi.total_amount
                 FROM order_items oi
                 JOIN products p ON oi.products_id = p.products_id
                 WHERE oi.orders_id = $1`,
                [orderId]
            );

            orderDetails.items = itemsResult.rows;

            await client.query("COMMIT");
            return { error: false, message: "Order details fetched successfully", data: orderDetails };
        } catch (err) {
            console.error("Error fetching order details:", err);
            return errorResponse("Database error",err);


        }
    }
}







