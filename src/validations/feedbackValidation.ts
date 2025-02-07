import Joi from "joi";

export const feedbackValid = Joi.object({
    ratings: Joi.number().min(1).max(5).required(),
    products_id: Joi.number().min(1).max(100).required()});


