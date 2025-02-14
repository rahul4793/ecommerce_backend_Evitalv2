import pool from '../config/db';
import { successResponse, errorResponse, ServiceResponse } from '../helpers/responseHelper';
import { db } from './db';
import { feedbackModel } from './feedbackModel';

const feedObj  =  new feedbackModel();

export class productModel extends db{
    public table: string = 'products';
    public uniqueField: string = 'products_id';

    constructor() {
        super();
        this.table = 'products'; 
        this.uniqueField = 'products_id';
    }
    async createProduct(
        product_name: string,
        url_slug: string,
        category_id: number | null,
        description: string,
        price: number,
        min_stock_quantity: number,
        stock_quantity: number,
        status: number
    ): Promise<ServiceResponse> {
        try {
            const data = {
                product_name,
                url_slug,
                category_id,
                description,
                price,
                min_stock_quantity,
                stock_quantity,
                status
            };
            const result = await this.insertRecord(data);
            return successResponse("Product created successfully", result);
        } catch (err) {
            return errorResponse("Error creating product", err);
        }
    };

    async getAllProducts(
        page: number = 1,
        priceOrder: string = "asc",
        searchQuery: string = "",
        minPrice?: number,
        maxPrice?: number,
        minRating?: number,
        maxRating?: number,
        categoryId?: number
    ): Promise<ServiceResponse> {
        const limit = 5;
        const offset = (page - 1) * limit;
        const orderBy = priceOrder.toLowerCase() === "desc" ? "DESC" : "ASC";

        try {
            let query = `SELECT * FROM products WHERE 1=1`;
            let params: any[] = [];

            if (searchQuery) {
                query += ` AND product_name ILIKE $${params.length + 1}`;
                params.push(`%${searchQuery}%`);
            }

            if (minPrice !== undefined) {
                query += ` AND price >= $${params.length + 1}`;
                params.push(minPrice);
            }

            if (maxPrice !== undefined) {
                query += ` AND price <= $${params.length + 1}`;
                params.push(maxPrice);
            }

            if (minRating !== undefined) {
                query += ` AND average_rating >= $${params.length + 1}`;
                params.push(minRating);
            }

            if (maxRating !== undefined) {
                query += ` AND average_rating <= $${params.length + 1}`;
                params.push(maxRating);
            }

            if (categoryId !== undefined) {
                query += ` AND category_id = $${params.length + 1}`;
                params.push(categoryId);
            }

            query += ` ORDER BY price ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
            params.push(limit, offset);

            const result = await pool.query(query, params);
            return successResponse("Products retrieved successfully", result.rows);
        } catch (err) {
            return errorResponse("Error fetching products", err);
        }
    };

    async getProductById(id: number): Promise<ServiceResponse> {
        try {
            const result = await this.selectRecord(id);
            if (!result) {
                return errorResponse("Product not found", null);
            }
            return successResponse("Product retrieved successfully", result);
        } catch (err) {
            console.log(err)
            return errorResponse("Error fetching product", err);
        }
    };

    async updateProduct(id: number, updateData: any): Promise<ServiceResponse> {
        try {
            const query =  await this.updateRecord(id,updateData)
            console.log(query)
            return query > 0
                ? successResponse("Product updated successfully", query)
                : errorResponse("Product not found or update failed", null);
        } catch (err) {
            return errorResponse("Error updating product", err);
        }
    };

    async deleteProduct(id: number): Promise<ServiceResponse> {
        try {
            const result = await this.deleteRecord(id);
            if (!result) {
                return errorResponse("Product not found", null);
            }
            return successResponse("Product deleted successfully", result);
        } catch (err) {
            return errorResponse("Error deleting product", err);
        }
    };

    async getProductByCategory(id: number): Promise<ServiceResponse> {
        try {
            const result = await pool.query(
                `SELECT * FROM products p JOIN categories c ON p.category_id = c.categories_id WHERE p.category_id = $1`,
                [id]
            );
            return successResponse("Products fetched by category", result.rows);
        } catch (err) {
            return errorResponse("Error fetching products by category", err);
        }
    };


async updateProductafterfeedback(id: number, updateData: any): Promise<ServiceResponse> {
    try {
        let objValue = feedObj.getFeedbacksProduct;
        let updateData = `average_rating = ` + objValue;
        const query =  await this.updateRecord(id,updateData)
        console.log(query)
        return query > 0
            ? successResponse("Product updated successfully", query)
            : errorResponse("Product not found or update failed", null);
    } catch (err) {
        return errorResponse("Error updating product", err);
    }
};





async getStockQuanity (productId: number){
    // select stock_quantity  from products where products_id =2;
     const result = await this.selectRecord(productId,"stock_quantity")
     return result;
}


async updateProductStock(client: any, productId: number, quantityOrdered: number) {
    try {
        const stockQuantity = await this.getStockQuanity(productId); 
        console.log(stockQuantity[0].stock_quantity);
        const data = {
            stock_quantity:Number(stockQuantity[0].stock_quantity - quantityOrdered)
        }
        const result = await this.updateRecord(productId,data);
        return result > 0
            ? successResponse("Product updated stock successfully", result)
            : errorResponse("Product not found or update failed product stock", null);
    } catch (err) {
        return errorResponse("Error updating product stock", err);
    }
}
async restoreProductStock(client: any, productId: number, quantityOrdered: number) {
    try {
        const stockQuantity = await this.getStockQuanity(productId); 
        console.log(stockQuantity[0].stock_quantity);
        const data = {
            stock_quantity:Number(stockQuantity[0].stock_quantity + quantityOrdered)
        }
        const result = await this.updateRecord(productId,data);
        return result > 0
            ? successResponse("Product updated stock successfully", result)
            : errorResponse("Product not found or update failed product stock", null);
    } catch (err) {
        return errorResponse("Error updating product stock", err);
    }
}
}