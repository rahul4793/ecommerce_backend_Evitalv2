import { db } from './db';
import { successResponse, errorResponse } from '../helpers/responseHelper';

export class cartModel extends db {
    constructor() {
        super();
        this.table = 'carts';
        this.uniqueField = 'carts_id';
    }

    async getCartIdByUser(userId: number) {
        try {
            this.where = `WHERE users_id = ${userId}`;
            const result = await this.allRecords('carts_id');
            return result && result.length > 0
                ? successResponse("Cart details", result[0].carts_id)
                : errorResponse("No cart found", null); 
        } catch (error) {
            return errorResponse("Database error fetching cart", error);
        }
    }

    async createCartForUser(userId: number){
        try {
            const result = await this.insertRecord({ users_id: userId });
            return result
                ? successResponse("Cart created", result.carts_id)
                : errorResponse("Database error creating cart", null);
        } catch (error) {
            return errorResponse("Database error creating cart", error);
        }
    }

    async getCartItemsByCartId(cartId: number) {
        try {
            this.table = 'cart_items';
            this.where = `WHERE carts_id = ${cartId}`;
            const result = await this.allRecords();
            this.table = 'carts'; // Reset table
            return successResponse("Cart items retrieved", result);
        } catch (error) {
            return errorResponse("Database error fetching cart items", error);
        }
    }

    async getCartDetails(userId: number) {
        try {
            let cartResult = await this.getCartIdByUser(userId);
            if (cartResult.error) {
                cartResult = await this.createCartForUser(userId);
                if (cartResult.error) return cartResult;
            }
            const itemsResult = await this.getCartItemsByCartId(cartResult.data);
            return itemsResult; 
        } catch (error) {
            console.error("Error in getCartDetails model:", error);
            return errorResponse("Error fetching cart", error);
        }
    }

    async addItemToCartDB(cartId: number, productId: number, quantity: number) {
        try {
            this.table = 'cart_items';
            const result = await this.insertRecord({ carts_id: cartId, products_id: productId, quantity });
            this.table = 'carts';
            return result
                ? successResponse("Item added to cart", result)
                : errorResponse("Database error adding item to cart", null);
        } catch (error) {
            return errorResponse("Database error adding item to cart", error);
        }
    }
    
    async addItemToCart(userId: number, productId: number, quantity: number) {
        try {
            if (!productId || !quantity || quantity <= 0) {
                return errorResponse("Product ID and valid quantity are required", null);
            }
            let cartResult = await this.getCartIdByUser(userId);
            if (cartResult.error) {
                cartResult = await this.createCartForUser(userId);
                if (cartResult.error) return cartResult;
            }
            return await this.addItemToCartDB(cartResult.data, productId, quantity);
        } catch (error) {
            return errorResponse("Error adding item to cart", null);
        }
    }
}