import pool from '../config/db';

interface ServiceResponse {
    error: boolean;
    message: string;
    data: any;
}

export const createProduct = async (
    product_name: string,
    url_slug: string,
    category_id: number | null,
    description: string,
    price: number,
    min_stock_quantity: number,
    stock_quantity: number,
    status: number
): Promise<ServiceResponse> => {
    try {
        const result = await pool.query(
            `INSERT INTO products (product_name, url_slug, category_id, description, price, min_stock_quantity, stock_quantity, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [product_name, url_slug, category_id, description, price, min_stock_quantity, stock_quantity, status]
        );

        return { error: false, message: "Product created successfully", data: result.rows[0] };
    } catch (err) {
        return { error: true, message: "Error creating product", data: err };
    }
};


export const getAllProducts = async (
    page: number = 1,
    priceOrder: string = "asc",
    searchQuery: string = "",
    minPrice?: number,
    maxPrice?: number,
    minRating?: number,
    maxRating?: number,
    categoryId?: number
): Promise<ServiceResponse> => {
    const limit = 5; // Items per page
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

        return { error: false, message: "Products retrieved successfully", data: result.rows };
    } catch (err) {
        return { error: true, message: "Error fetching products", data: err };
    }
};



export const getProductById = async (id: number): Promise<ServiceResponse> => {
    try {
        const result = await pool.query(`SELECT * FROM products WHERE products_id = $1`, [id]);
        if (result.rows.length === 0) {
            return { error: true, message: "Product not found", data: null };
        }
        return { error: false, message: "Product retrieved successfully", data: result.rows[0] };
    } catch (err) {
        return { error: true, message: "Error fetching product", data: err };
    }
};

// export const updateProduct = async (
//     id: number,
//     product_name: string,
//     url_slug: string,
//     category_id: number | null,
//     description: string,
//     price: number,
//     min_stock_quantity: number,
//     stock_quantity: number,
//     status: number
// ): Promise<ServiceResponse> => {
//     try {
//         const result = await pool.query(
//             `UPDATE products 
//              SET product_name=$1, url_slug=$2, category_id=$3, description=$4, price=$5, min_stock_quantity=$6, stock_quantity=$7, status=$8, updated_at=NOW()
//              WHERE products_id=$9 RETURNING *`,
//             [product_name, url_slug, category_id, description, price, min_stock_quantity, stock_quantity, status, id]
//         );
//         return { error: false, message: "Product updated successfully", data: result.rows[0] };
//     } catch (err) {
//         return { error: true, message: "Error updating product", data: err };
//     }
// };
export const updateProduct = async (id: number, updateData: any): Promise<ServiceResponse> => {
    try {
        const fields = [];
        const values = [];
        let index = 1;

        for (const key in updateData) {
            if (updateData[key] !== undefined && updateData[key] !== null) {
                fields.push(`${key} = $${index}`);
                values.push(updateData[key]);
                index++;
            }
        }

        if (fields.length === 0) {
            return { error: true, message: "No fields provided for update", data: null };
        }
        fields.push(`updated_at = NOW()`);
        const query = `
            UPDATE products 
            SET ${fields.join(", ")}
            WHERE products_id = $${index}
            RETURNING *`;
        values.push(id);
        const result = await pool.query(query, values);
        return result.rows.length > 0
            ? { error: false, message: "Product updated successfully", data: result.rows[0] }
            : { error: true, message: "Product not found or update failed", data: null };
    } catch (err) {
        return { error: true, message: "Error updating product", data: err };
    }
};

export const deleteProduct = async (id: number): Promise<ServiceResponse> => {
    try {
        const result = await pool.query(`DELETE FROM products WHERE products_id = $1 RETURNING *`, [id]);
        if (result.rows.length === 0) {
            return { error: true, message: "Product not found", data: null };
        }
        return { error: false, message: "Product deleted successfully", data: result.rows[0] };
    } catch (err) {
        return { error: true, message: "Error deleting product", data: err };
    }
};

export const getProductByCategory = async (id: number): Promise<ServiceResponse> => {
    try {
        const result = await pool.query(
            `SELECT * FROM products p JOIN categories c ON p.category_id = c.categories_id WHERE p.category_id = $1`,
            [id]
        );
        return { error: false, message: "Products fetched by category", data: result.rows };
    } catch (err) {
        return { error: true, message: "Error fetching products by category", data: err };
    }
};
