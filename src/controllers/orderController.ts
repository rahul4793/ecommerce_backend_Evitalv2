import { Request, Response } from 'express';
import {
    createOrderDB, getUserOrdersDB, getAllOrdersDB, updateOrderStatusDB, cancelOrderDB,
    addItemToOrderDB, calculateOrderTotal, getUserAddressById, getUserDefaultAddress,
    addItemsToOrderDB,
    getProductDetails,
    updateProductStock
} from '../models/orderModel';
import { clearCartDB, getCartIdByUser, getCartItemsByCartId } from '../models/cartModel';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const { discount_id, address_id } = req.body;

        let selectedAddress = address_id
            ? await getUserAddressById(userId, address_id)
            : await getUserDefaultAddress(userId);

        if (!selectedAddress) {
            res.status(400).json({ message: "No valid address found." });
            return;
        }

        // cart id details in structure
        const cartResult = await getCartIdByUser(userId);

        if (cartResult.error || !cartResult.data) {
            res.status(400).json({ message: "Cart not found or error fetching cart." });
            return;
        }

        const cartId = cartResult.data; // cart id stored

        // Fetch Cart Items
        const cartItemsResult = await getCartItemsByCartId(cartId);

        // cartItemsResult.data is always an array and not empty
        const cartItems = Array.isArray(cartItemsResult.data) ? cartItemsResult.data : [];

        if (cartItems.length === 0) {
            res.status(400).json({ message: "Cart is empty. Add items before placing an order." });
            return;
        }

        // calculate total price
        let totalAmount = 0;
        const orderItems = [];

        for (const item of cartItems) {
            const product = await getProductDetails(item.products_id);
            if (!product) {
                res.status(400).json({ message: `Product ID ${item.products_id} not found.` });
                return;
            }

            if (product.stock_quantity < item.quantity) {
                res.status(400).json({ message: `Not enough stock for ${product.product_name}` });
                return;
            }

            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            // order item entry
            orderItems.push({
                product_id: item.products_id,
                product_name: product.product_name,
                price: product.price,
                quantity: item.quantity,
                total_amount: itemTotal,
            });
        }

        // applying discount
        const { discountAmount, netAmount, shippingAmount } = await calculateOrderTotal(totalAmount, discount_id);
        // Order Entry
        const newOrder = await createOrderDB(userId, selectedAddress.addresses_id, discount_id, totalAmount, discountAmount, netAmount, shippingAmount);

        if (!newOrder) {
            res.status(500).json({ message: "Failed to create order." });
            return;
        }

        await addItemsToOrderDB(newOrder.orders_id, orderItems);

        for (const item of orderItems) {
            await updateProductStock(item.product_id, item.quantity);
        }

        await clearCartDB(userId);

        res.status(201).json({ message: "Order placed successfully!", order: newOrder, items: orderItems });
    } catch (err) {
        console.error("Error in createOrder:", err);
        res.status(500).json({ message: "Error creating order", error: err });
    }
};


export const getUserOrders = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const orders = await getUserOrdersDB(userId);
        res.status(200).json({ orders });
    } catch (err) {
        res.status(500).json({ message: "Error fetching orders", error: err });
    }
};

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await getAllOrdersDB();
        res.status(200).json({ orders });
    } catch (err) {
        res.status(500).json({ message: "Error fetching orders", error: err });
    }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { order_id, status } = req.body;

        if (!order_id || typeof order_id !== 'number') {
            res.status(400).json({ message: "Invalid order_id" });
            return;
        }

        if (![1, 2, 3, 4].includes(status)) {
            res.status(400).json({ message: "Invalid status value." });
            return;
        }

        const updatedOrder = await updateOrderStatusDB(order_id, status);
        if (!updatedOrder) {
            res.status(404).json({ message: "Order not found or could not update status." });
            return;
        }

        res.status(200).json({ message: "Order status updated", updatedOrder });
    } catch (err) {
        res.status(500).json({ message: "Error updating order status", error: err });
    }
};

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const isAdmin = (req as any).user?.role === 1;
        const { order_id } = req.body;

        if (!order_id || typeof order_id !== 'number') {
            res.status(400).json({ message: "Invalid order_id" });
            return;
        }

        const success = await cancelOrderDB(userId, order_id, isAdmin);
        if (!success) {
            res.status(400).json({ message: "Cannot cancel this order." });
            return;
        }
        res.status(200).json({ message: "Order canceled successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error canceling order", error: err });
    }
};
