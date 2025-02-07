import Joi from "joi";

export const productValidating = Joi.object({
    product_name: Joi.string().min(3).max(255).required(),
    url_slug: Joi.string().min(3).max(255).required(), 
    category_id: Joi.number().integer().positive().allow(null), 
    description: Joi.string().allow("").max(1000),
    price: Joi.number().precision(2).positive().required(),
    min_stock_quantity: Joi.number().integer().min(0).required(),
    stock_quantity: Joi.number().integer().min(0).required(),
    status: Joi.number().valid(0, 1).default(1)
    });