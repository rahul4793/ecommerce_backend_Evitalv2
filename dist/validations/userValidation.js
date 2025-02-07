"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLoginSchema = exports.userSignupSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.userSignupSchema = joi_1.default.object({
    first_name: joi_1.default.string().min(3).max(50).required(),
    last_name: joi_1.default.string().min(3).max(50).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
});
exports.userLoginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
});
