import Joi from "joi";
export const returnValidating = Joi.object({
    order_items_id: Joi.number().min(1).max(100).required(),
    return_reason: Joi.string().min(10).max(255).required(), 
    quantity: Joi.number().integer().min(1).max(100).positive().required(), 
    });


    export const approveValidating = Joi.object(
        {
            return_items_id:Joi.number().min(1).max(100).required()
        }
    )
