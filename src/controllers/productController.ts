
import { Request, Response } from 'express';
import { productModel} from '../models/productModel'

const productObj = new productModel();
export const createProductController = async (req: Request, res: Response): Promise<void> => {
    try {
        const newProduct = await productObj.createProduct(
            req.body.product_name,
            req.body.url_slug,
            req.body.category_id || null,
            req.body.description,
            req.body.price,
            req.body.min_stock_quantity,
            req.body.stock_quantity,
            req.body.status || 1 
        );
        res.status(201).json({ error: false, message: "Product created successfully", data: newProduct.data });
    } catch (err) {
        res.status(500).json({ error: true, message: "Error creating product", data: err });
    }
};

export const getProductsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { 
            page = 1, 
            priceOrder = "asc", 
            searchQuery = "", 
            minPrice, 
            maxPrice, 
            minRating, 
            maxRating, 
            categoryId 
        } = req.body;
        const products = await productObj.getAllProducts(page, priceOrder, searchQuery, minPrice, maxPrice, minRating, maxRating, categoryId);
        res.status(200).json({
            error: false,
            message: "Products fetched successfully",
            data: products.data
        });
    } catch (err) {
        res.status(500).json({ error: true, message: "Error fetching products", data: err });
    }
};


export const getProductController = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await productObj.getProductById(Number(req.params.id));
        if (!product) {
             res.status(404).json({ error: true, message: "Product not found", data: null }); return
        }
        res.status(200).json({ error: false, message: "Product retrieved successfully", data: product.data });
    } catch (err) {
        res.status(500).json({ error: true, message: "Error fetching product", data: err });
    }
};

export const updateProductController = async (req: Request, res: Response): Promise<void> => {
    try {
        const productId = Number(req.params.id);
        if (Object.keys(req.body).length === 0) {
            res.status(400).json({ error: true, message: "No fields provided for update", data: null });
            return;
        }
        const updatedProduct = await productObj.updateProduct(productId, req.body);
        res.status(updatedProduct.error ? 500 : 200).json(updatedProduct);
    } catch (err) {
        res.status(500).json({ error: true, message: "Error updating product", data: err });
    }
};

export const deleteProductController = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedProduct = await productObj.deleteProduct(Number(req.params.id));
        if (!deletedProduct) {
             res.status(404).json({ error: true, message: "Product not found", data: null }); return
        }
        res.status(200).json({ error: false, message: "Product deleted successfully", data: deletedProduct.data });
    } catch (err) {
        res.status(500).json({ error: true, message: "Error deleting product", data: err });
    }
};

export const getProductByCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const categoryProducts = await productObj.getProductByCategory(Number(req.params.id));
        if (categoryProducts.data.length === 0) {
             res.status(404).json({ error: true, message: "No products found in this category", data: null });return
        }
        res.status(200).json({ error: false, message: "Products by category fetched successfully", data: categoryProducts.data });
    } catch (err) {
        res.status(500).json({ error: true, message: "Error fetching products by category", data: err });
    }
};
