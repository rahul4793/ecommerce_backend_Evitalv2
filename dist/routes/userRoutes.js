"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const validateRequest_1 = __importDefault(require("../middleware/validateRequest"));
const userValidation_1 = require("../validations/userValidation");
const router = express_1.default.Router();
router.post('/signup', (0, validateRequest_1.default)(userValidation_1.userSignupSchema), userController_1.signup);
router.post('/login', (0, validateRequest_1.default)(userValidation_1.userLoginSchema), userController_1.login);
exports.default = router;
