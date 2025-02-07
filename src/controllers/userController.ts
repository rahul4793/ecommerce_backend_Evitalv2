
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {
    createUser, deleteUserFromDB, findUserByEmail, getUserByEmailFromDB, getUserByIdFromDB, updateUserInDB
} from '../models/userModel';

dotenv.config();

const secretKey = process.env.JWT_SECRET || "Rahulsecret"; 

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { first_name, last_name, email, password, phone_number } = req.body;

        const existingUser = await findUserByEmail(email);
        if (existingUser.error) {
            res.status(500).json({ error: true, message: existingUser.message, data: existingUser.data });
            return;
        }

        if (existingUser.data) {
            res.status(400).json({ error: true, message: 'Email already in use', data: null });
            return;
        }

        const newUser = await createUser(first_name, last_name, email, password, phone_number);
        if (newUser.error) {
            res.status(500).json({ error: true, message: newUser.message, data: newUser.data });
            return;
        }

        res.status(201).json({ error: false, message: 'User registered successfully', data: newUser.data });
    } catch (err) {
        console.error("Error in signup:", err);
        res.status(500).json({ error: true, message: 'Server error', data: err });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email);
        if (user.error) {
            res.status(500).json({ error: true, message: user.message, data: {} });
            return;
        }

        if (!user.data) {
            res.status(400).json({ error: true, message: 'Invalid credentials', data: null });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.data.password);
        if (!isMatch) {
            res.status(400).json({ error: true, message: 'Invalid credentials', data: null });
            return;
        }

        const token = jwt.sign(
            { userId: user.data.users_id, role: user.data.role },
            secretKey,
            { expiresIn: '4h' }
        );

        res.status(200).json({ error: false, message: 'Login successful', data: { token } });
    } catch (err) {
        res.status(500).json({ error: true, message: 'Server error', data: err });
    }
};

export const logout = (req: Request, res: Response): void => {
    res.status(200).json({ error: false, message: "Logged out successfully. Clear your cookies now", data: null });
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;

        if (!userId) {
            res.status(401).json({ error: true, message: "Unauthorized. Please log in.", data: null });
            return;
        }

        const user = await getUserByIdFromDB(userId);
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

        if (!email) {
            res.status(400).json({ error: true, message: "Email is required.", data: null });
            return;
        }

        const user = await getUserByEmailFromDB(email);

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
        const updatedUser = await updateUserInDB((req as any).user?.userId, req.body);
        res.status(200).json({ error: false, message: "Profile updated successfully", data: updatedUser });
    } catch (err) {
        res.status(500).json({ error: true, message: "Error updating profile", data: err });
    }
};

export const deleteUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = Number(req.params.id);

        if (!userId) {
            res.status(400).json({ error: true, message: "Invalid user ID", data: null });
            return;
        }

        const deletedUser = await deleteUserFromDB(userId);
        if (!deletedUser) {
            res.status(404).json({ error: true, message: "User not found", data: null });
            return;
        }

        res.status(200).json({ error: false, message: "User deleted successfully", data: null });
    } catch (err) {
        res.status(500).json({ error: true, message: "Error deleting user", data: err });
    }
};
