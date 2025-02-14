
import { Request, Response } from 'express';
import { productModel} from '../models/productModel'
import { helper } from '../helpers/responseHelper';

const objHelper  =  new helper();
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
        objHelper.success(res, newProduct.message, newProduct.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
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
        objHelper.success(res, products.message, products.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};


export const getProductController = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await productObj.getProductById(Number(req.params.id));
        if(product.error){
            objHelper.error(res, 400, product.message); return
        }
        objHelper.success(res, product.message, product.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};



export const updateProductController = async (req: Request, res: Response): Promise<void> => {
    try {
        const productId = Number(req.params.id);
        const updatedProduct = await productObj.updateProduct(productId, req.body);
        if(updatedProduct.error){
            objHelper.error(res, 400, updatedProduct.message); return
        }
        objHelper.success(res, updatedProduct.message, updatedProduct.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};


export const deleteProductController = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedProduct = await productObj.deleteProduct(Number(req.params.id));
        if(deletedProduct.error){
            objHelper.error(res, 400, deletedProduct.message); return
        }
        objHelper.success(res, deletedProduct.message, deletedProduct.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};
export const getProductByCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const categoryProducts = await productObj.getProductByCategory(Number(req.params.id));
        if(categoryProducts.error){
            objHelper.error(res, 400, categoryProducts.message); return
        }
        objHelper.success(res, categoryProducts.message, categoryProducts.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};