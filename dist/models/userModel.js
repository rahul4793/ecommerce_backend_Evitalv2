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
exports.findUserByEmail = exports.createUser = void 0;
const db_1 = __importDefault(require("../config/db"));
const createUser = (first_name, last_name, email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
        INSERT INTO Users (First_name, Last_name, Email, Password)
        VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const { rows } = yield db_1.default.query(query, [first_name, last_name, email, password]);
    return rows[0];
});
exports.createUser = createUser;
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `SELECT * FROM Users WHERE Email = $1`;
    const { rows } = yield db_1.default.query(query, [email]);
    return rows[0];
});
exports.findUserByEmail = findUserByEmail;
