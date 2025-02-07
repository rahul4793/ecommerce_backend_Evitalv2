import Joi from "joi";

export const addressSchema = Joi.object({
    full_address: Joi.string().min(5).max(255).required(),
    state: Joi.string().min(2).max(100).required(),
    city: Joi.string().min(2).max(100).required(),
    zip_code: Joi.string().length(6).pattern(/^\d{6}$/).required()
});

export const updateAddressjoi = Joi.object({
    full_address: Joi.string().min(5).max(255),
    state: Joi.string().min(2).max(100),
    city: Joi.string().min(2).max(100),
    zip_code: Joi.string().length(6).pattern(/^\d{6}$/)
});


