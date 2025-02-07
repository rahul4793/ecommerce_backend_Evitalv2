"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const userModel_1 = require("../models/userModel");
dotenv_1.default.config();
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { first_name, last_name, email, password } = req.body;
    try {
        const existingUser = yield (0, userModel_1.findUserByEmail)(email);
        if (existingUser) {
            res.status(400).json({ message: 'Email already in use' });
            return; // Early return, do not proceed further
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = yield (0, userModel_1.createUser)(first_name, last_name, email, hashedPassword);
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield (0, userModel_1.findUserByEmail)(email);
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return; // Early return if user is not found
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return; // Early return if password does not match
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.users_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});
exports.login = login;
