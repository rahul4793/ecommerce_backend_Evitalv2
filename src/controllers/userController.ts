
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { userClass} from '../models/userModel'
import { blacklistModel } from '../models/blacklistModel';
const userObj = new userClass();
const blackObj = new blacklistModel();


dotenv.config();

const secretKey = process.env.JWT_SECRET || "Rahulsecret"; 

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { first_name, last_name, email, password, phone_number } = req.body;
        const result = await userObj.createUser(first_name, last_name, email, password, phone_number);
        if (result.error) {
             res.status(result.error ? 400 : 500).json(result); return
        }
        res.status(201).json(result); 
    } catch (error) {
        console.error("Error in signup controller:", error);
        res.status(500).json({ error: true, message: 'Server error', data: {} });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const result = await userObj.loginUserService(email, password);
        if (result.error) {
            res.status(400).json({ 
                error: true,
                message: result.message,
                data: null,
            });
            return;
        }
        res.status(200).json({
            error: false,
            message: result.message,
            data: result.data,
        });

    } catch (error) {
        console.error("Login Controller Error:", error); 
        res.status(500).json({
            error: true,
            message: "Error in login",
            data: null,
        });
    }
};


export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.header('Authorization')?.split(' ')[1];
        if (!token) {
             res.status(400).json({ error: true, message: "No token provided" }); return
        }
        const result = await blackObj.isTokenBlacklisted(token) ?
            { error: true, message: "Token is already invalidated" } :
            await blackObj.blacklistToken(token).then(() => ({ error: false, message: "Logged out successfully" }));

        res.status(result.error ? 400 : 200).json(result);
    } catch (err) {
        res.status(500).json({ error: true, message: "Error logging out", data: err });
    }
};


export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const user = await userObj.getUserByIdFromDB(userId);
        if (!user.data) {
            res.status(404).json({ error: true, message: "User not found", data: null });
            return;
        }
        res.status(200).json({ error: false, message: "User profile fetched successfully", data: user.data });
    } catch (err) {
        res.status(500).json({ error: true, message: "Error fetching user profile", data: err });
    }
};


export const getUserByEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const user = await userObj.getUserByEmailFromDB(email);
        if (!user.data) { 
            res.status(404).json({ error: true, message: "User not found.", data: null });
            return;
        }
        res.status(200).json({ error: false, message: "User found", data: user.data });
    } catch (err) {
        res.status(500).json({ error: true, message: "Error finding user", data: err });
    }
};


export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
    try { 
        const userData = req.body;
        const updatedUser = await userObj.updateUserInDB((req as any).user?.userId, req.body);
        res.status(200).json({ error: false, message: "Profile updated successfully", data: updatedUser.data });
    } catch (err) {
        res.status(500).json({ error: true, message: "Error updating profile", data: err });
    }
};


export const deleteUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = Number(req.params.id);
        const deletedUser = await userObj.deleteUserFromDB(userId);
        if (deletedUser.error) {
            res.status(404).json({ error: true, message: "User not found", data: null });
            return;
        }
        res.status(200).json({ error: false, message: "User deleted successfully", data: null });
    } catch (err) {
        res.status(500).json({ error: true, message: "Error deleting user", data: err });
    }
};
