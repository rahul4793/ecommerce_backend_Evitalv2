import Joi from "joi";

export const cartValid = Joi.object({
    product_id: Joi.number().min(1).max(10).required(),
    quantity: Joi.number().min(1).max(100).required(),
    });


    export const quantitycartValid = Joi.object({
        quantity: Joi.number().min(1).max(100).required(),
        });