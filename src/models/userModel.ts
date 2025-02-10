import pool from '../config/db';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
interface ServiceResponse {
    error: boolean;
    message: string;
    data: any;
}
dotenv.config();


export class userClass{

async findUserByEmail (email: string): Promise<ServiceResponse>  {
    try {
        const query = `SELECT * FROM users WHERE email = $1`;
        const { rows } = await pool.query(query, [email]);

        return {
            error: false,
            message: "User found",
            data: rows[0] || null,
        };
    } catch (error) {
        console.error("Database error in findUserByEmail:", error);
        return {
            error: true,
            message: "Database error while searching for user",
            data: {}, 
        };
    }
};

async loginUserService  (email: string, password: string): Promise<ServiceResponse> {
    try {
        const query = `SELECT * FROM users WHERE email = $1`;
        const { rows } = await pool.query(query, [email]);
        const user = rows[0];

        if (!user) {
            return {
                error: true,
                message: 'Invalid credentials',
                data: null,
            };
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return {
                error: true,
                message: 'Invalid credentials',
                data: null,
            };
        }
        const token = jwt.sign(
            { userId: user.users_id, role: user.role },
            process.env.JWT_SECRET as string, 
            { expiresIn: '4h' }
        );

        return {
            error: false,
            message: 'Login successful',
            data: { token },
        };

    } catch (error) {
        console.error("Login Service Error:", error);
        return {
            error: true,
            message: 'Server error',
            data: null,
        };
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
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (first_name, last_name, email, password, phone_number) 
             VALUES ($1, $2, $3, $4, $5) RETURNING users_id, first_name, last_name, email, phone_number`,
            [first_name, last_name, email, hashedPassword, phone_number || null]
        );

        return {
            error: false,
            message: "User created successfully",
            data: result.rows[0],
        };
    } catch (error) {
        return {
            error: true,
            message: "Database error while creating user",
            data: error,
        };
    }
};

async getUserByIdFromDB  (id: number): Promise<ServiceResponse>  {
    try {
        const result = await pool.query(
            `SELECT users_id, first_name, last_name, email, phone_number FROM users WHERE users_id = $1`,
            [id]
        );
        return { error: false, message: "OK", data: result.rows[0] };
    } catch (error) {
        return { error: true, message: "NOT OK", data: error };
    }
};

async updateUserInDB (id: number, userData: any): Promise<ServiceResponse> {
    const fields = [];
    const values = [];
    let index = 1;

    for (const key in userData) {
        if (userData[key] !== undefined && userData[key] !== null) {
            fields.push(`${key} = $${index}`);
            values.push(userData[key]);
            index++;
        }
    }

    if (fields.length === 0) {
        throw new Error("No fields to update");
    }

    fields.push(`updated_at = NOW()`);
    const query = `
        UPDATE users 
        SET ${fields.join(", ")}
        WHERE users_id = $${index}
        RETURNING users_id, first_name, last_name, email, phone_number`;

    values.push(id);

    const result = await pool.query(query, values);
    return { error: false, message: "Profile updated successfully", data: result.rows[0] };
};


async deleteUserFromDB (id: number): Promise<ServiceResponse> {
    
    const result = await pool.query(`DELETE FROM users WHERE users_id = $1 RETURNING users_id`, [id]);
    return { error: false, message: "User deleted", data: result.rows[0] };
};

async getUserByEmailFromDB  (email: string): Promise<ServiceResponse>  {
    const result = await pool.query(
        `SELECT users_id, first_name, last_name, email, phone_number, role, status, created_at, updated_at 
         FROM users WHERE email = $1`,
        [email]
    );
    return { error: false, message: "User found", data: result.rows[0] };
};


}