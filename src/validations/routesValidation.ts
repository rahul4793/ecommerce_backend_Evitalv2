import Joi from "joi";
import { Request, Response, NextFunction } from "express";

const paramsSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

export const validateParams = (req: Request, res: Response, next: NextFunction): void => {
    const { error } = paramsSchema.validate(req.params);
    
    if (error) {
        res.status(400).json({ message: error.details[0].message });
    } else {
        next(); 
    }
};


