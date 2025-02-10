import Joi from "joi";

export const orderValidating = Joi.object({
    discount_id: Joi.number().min(1).max(100).required(),
    address_id: Joi.number().min(1).max(1000),
    cart_items:Joi.array().min(1).max(1000)});
    


    export const canceOorderValidating = Joi.object({
        order_id: Joi.number().min(1).max(100).required(),
        });


        export const updateOrderStatusValidating = Joi.object({
            order_id: Joi.number().min(1).max(100).required(),
            status: Joi.number().min(1).max(1000).required()});
   
