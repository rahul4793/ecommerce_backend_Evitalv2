
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { userClass} from '../models/userModel'
import { blacklistModel } from '../models/blacklistModel';
import { errorResponse, helper, successResponse } from '../helpers/responseHelper';
const userObj = new userClass();
const blackObj = new blacklistModel();
const objHelper  =  new helper();

dotenv.config();

const secretKey = process.env.JWT_SECRET || "Rahulsecret"; 

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { first_name, last_name, email, password, phone_number } = req.body;
        const result = await userObj.createUser(first_name, last_name, email, password, phone_number);
        if(result.error){
            objHelper.error(res, 400, result.message);
        }
        objHelper.success(res, result.message, result.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};


export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const result = await userObj.loginUserService(email, password);
        if(result.error){
            objHelper.error(res, 400, result.message);
        }
        objHelper.success(res, result.message, result.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};



export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.header('Authorization')?.split(' ')[1];
        if (!token) {
             res.status(500).json(errorResponse("Server error",{}))
             res.status(400).json({ error: true, message: "No token provided" }); return
        }
        const result = await blackObj.isTokenBlacklisted(token) ? { error: true, message: "Token is already invalidated" } :
            await blackObj.blacklistToken(token).then(() => ({ error: false, message: "Logged out successfully" }));
        res.status(result.error ? 400 : 200).json(result);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};


export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const user = await userObj.getUserByIdFromDB(userId);
        if(user.error){
            objHelper.error(res, 400, user.message);
        }
        objHelper.success(res, user.message, user.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};



export const getUserByEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const user = await userObj.getUserByEmailFromDB(email);
        if(user.error){
            objHelper.error(res, 400, user.message);
        }
        objHelper.success(res, user.message, user.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
    try { 
        const userData = req.body;
        const updatedUser = await userObj.updateUserInDB((req as any).user?.userId, req.body);
        if(updatedUser.error){
            objHelper.error(res, 400, updatedUser.message);
        }
        objHelper.success(res, updatedUser.message, updatedUser.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};


export const deleteUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = Number(req.params.id);
        const deletedUser = await userObj.deleteUserFromDB(userId);
        if(deletedUser.error){
            objHelper.error(res, 400, deletedUser.message);
        }
        objHelper.success(res, deletedUser.message, deletedUser.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};
