import { errorResponse, successResponse } from "../helpers/responseHelper";
import { db } from "./db";

export class cartItemsModel extends db {
    constructor() {
        super();
        this.table = 'cart_items'; 
        this.uniqueField = 'cart_items_id';
    }
  async updateCartItemDB(userId: number, itemId: number, quantity: number) {
        try {
            const data = {
                users_id: userId,
           cart_items_id:itemId, quantity
            };
            this.where = `where cart_items_id = ${itemId} AND carts_id = (SELECT carts_id FROM carts WHERE users_id = ${userId})`;
            const result = await this.updateRecord(userId,data)
            return result > 0
                ? successResponse("Cart item updated", null)
                : errorResponse("Cart item not found or unauthorized", null);
        } catch (error) {
            return errorResponse("Database error updating cart item", error);
        }
    }

async removeCartItemDB(userId: number, itemId: number) {
    try {
         this.where = `where cart_items_id = ${itemId} AND carts_id = (SELECT carts_id FROM carts WHERE users_id = ${userId})`;
        const result =await this.deleteRecord(itemId)
        return result > 0
            ? successResponse("Cart item removed", null)
            : errorResponse("Cart item not found or unauthorized", null);
    } catch (error) {
        return errorResponse("Database error removing cart item", error);
    }
}

async clearCartDB(userId: number) {
    try {
     this.where = `carts_id = (SELECT carts_id FROM carts WHERE users_id = ${userId})`;
        const result = await this.deleteRecord(userId);
        return successResponse("Cart cleared successfully", result);
    } catch (error) {
        return errorResponse("Database error clearing cart", error);
    }
}


async removeSelectedCartItems(client: any, cartItems: number[], userId: number) {
    this.where = `WHERE cart_items_id IN(${cartItems}) 
         AND carts_id = (SELECT carts_id FROM carts WHERE users_id = ${userId})`
     await this.delete(this.table,this.where)
}
}
