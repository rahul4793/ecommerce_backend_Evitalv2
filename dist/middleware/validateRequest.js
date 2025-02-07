"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            res.status(400).json({ errors: error.details.map((err) => err.message) });
            return; // End the middleware execution here if validation fails.
        }
        next(); // Call next() to continue to the next middleware or controller
    };
};
exports.default = validateRequest;
