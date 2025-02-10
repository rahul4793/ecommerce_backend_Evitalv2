import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import dotenv from 'dotenv';
import { blacklistModel } from '../models/blacklistModel';

const blackObj = new blacklistModel();

dotenv.config();
// const JWT_SECRET = "Rahulsecret";

export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: "Access Denied. No token provided." });
        return;
    }
try {
    const blacklisted = await blackObj.isTokenBlacklisted(token);
    if (blacklisted) {
        res.status(403).json({ message: "Invalid token. Please log in again." });
        return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = decoded;
    next();
} catch (err) {
    res.status(403).json({ message: "Invalid token. Access forbidden." });
}
};
export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user; 
    if (!user || !user.userId) {
        res.status(403).json({ message: "Access Denied. Unauthorized user." });
        return;
    }
    try {
        const result = await pool.query(`SELECT role FROM users WHERE users_id = $1`, [user.userId]);
        if (result.rows.length === 0 || result.rows[0].role !== 1) {
            res.status(403).json({ message: "Access Denied. Admins only." });
            return;
        }
        next(); //
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};





import _ from "lodash";

const debouncedRequests = new Map<string, NodeJS.Timeout>();

export const debounceMiddleware = (delay = 500) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const requestKey = req.ip + req.originalUrl;

        if (debouncedRequests.has(requestKey)) {
            clearTimeout(debouncedRequests.get(requestKey)!);
        }

        const timeout = setTimeout(() => {
            debouncedRequests.delete(requestKey);
            next();
        }, delay);

        debouncedRequests.set(requestKey, timeout);
    };
};
