"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Ensure .env variables are loaded
const pg_1 = require("pg");
// Log the environment variables for debugging purposes
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);
if (!process.env.DB_USER || !process.env.DB_PASS || !process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_PORT) {
    console.error("One or more required environment variables are missing.");
    process.exit(1); // Exit if any required variable is missing
}
const pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: Number(process.env.DB_PORT),
});
pool.connect()
    .then(() => {
    console.log("Connected to the database");
})
    .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1); // Exit if DB connection fails
});
exports.default = pool;
