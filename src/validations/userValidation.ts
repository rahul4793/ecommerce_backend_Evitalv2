import Joi from 'joi';

export const userSignupSchema = Joi.object({
    first_name: Joi.string().min(3).max(50).required(),
    last_name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone_number: Joi.string().pattern(/^[0-9]{10}$/).optional()
});

export const userLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});


