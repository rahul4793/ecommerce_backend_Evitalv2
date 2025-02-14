import pool from '../config/db';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { successResponse, errorResponse } from '../helpers/responseHelper';
import { db } from './db';

interface ServiceResponse {
    error: boolean;
    message: string;
    data: any;
}
dotenv.config();

export class userClass extends db{
    public table: string = 'users';
    public uniqueField: string = 'users_id';

    constructor() {
        super(); 
    }

async findUserByEmail (email: string): Promise<ServiceResponse>  {
    try {
        this.where = `where email = ${email}`;
        const query2 = await this.allRecords("*");
        const { rows } = await pool.query(query2, [email]);
        return successResponse("User found", rows[0] || null );
    } catch (error) {
        return errorResponse("Database error in findUserByEmail", error );
    }
};

async loginUserService  (email: string, password: string): Promise<ServiceResponse> {
    try {
        const query = `SELECT * FROM users WHERE email = $1`;
        const { rows } = await pool.query(query, [email]);
        const user = rows[0];

        if (!user) {
            const { rows } = await pool.query(query, [email]);
            return errorResponse("Invalid credentials", null );
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return errorResponse("Invalid credentials", null );
        }
        const token = jwt.sign(
            { userId: user.users_id, role: user.role },
            process.env.JWT_SECRET as string, 
            { expiresIn: '4h' }
        );
        return successResponse("Login successful", token );
    } catch (error) {
        console.error("Login Service Error:", error);
        return successResponse("Server error", null );
    }
};

async createUser  (
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    phone_number?: string
): Promise<ServiceResponse>  {
    try {
        const data = {
            first_name,
            last_name,
            email,
            password,
            phone_number
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        data.password= hashedPassword;
        const result2 = await this.insertRecord(data);
        return successResponse("User created successfully", result2 );
    } catch (error) {
        return errorResponse("Database error while creating user", error);
    }
};

    async getUserByIdFromDB(id: number): Promise<ServiceResponse> {
        try {
            const result = await this.selectRecord(id, 'users_id, first_name, last_name, email, phone_number');
            return successResponse("OK", result);
        } catch (error) {
            return errorResponse("NOT OK", error);
        }
    };

    async updateUserInDB(id: number, userData: any): Promise<ServiceResponse> {
        try {
            const result = await this.updateRecord(id, userData);
            if (result) {
                const updatedUser = await this.selectRecord(id, 'users_id, first_name, last_name, email, phone_number');
                return successResponse("Profile updated successfully", updatedUser);
            } else {
              return errorResponse("User not found or update failed", null);
            }

        } catch (error) {
            return errorResponse("Error updating user", error);
        }
    };

    async deleteUserFromDB(id: number): Promise<ServiceResponse> {
        try {
            const result = await this.deleteRecord(id);
            if(result){
              return successResponse("User deleted", {users_id: id});
            }else{
              return errorResponse("User not found or deletion failed", null);
            }

        } catch (error) {
            return errorResponse("Error deleting user", error);
        }
    };

    async getUserByEmailFromDB(email: string): Promise<ServiceResponse> {
        try {
            this.where = `where email = '${email}'`; 
            const result = await this.allRecords('users_id, first_name, last_name, email, phone_number, role, status, created_at, updated_at');
            if(result && result.length > 0){
              return successResponse("User found", result[0]);
            }else{
              return errorResponse("User not found", null);
            }

        } catch (error) {
            return errorResponse("Error fetching user", error);
        }
    };
}