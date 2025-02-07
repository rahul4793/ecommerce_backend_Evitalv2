import pool from '../config/db';
import bcrypt from 'bcryptjs';

interface ServiceResponse {
    error: boolean;
    message: string;
    data: any;
}

// Find user by email
export const findUserByEmail = async (email: string): Promise<ServiceResponse> => {
    try {
        const query = `SELECT * FROM users WHERE email = $1`;
        const { rows } = await pool.query(query, [email]);

        return {
            error: false,
            message: "User found",
            data: rows[0] || null,
        };
    } catch (error) {
        return {
            error: true,
            message: "Database error while searching for user",
            data: error,
        };
    }
};

// Create a new user
export const createUser = async (
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    phone_number?: string
): Promise<ServiceResponse> => {
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

// Get User By ID
export const getUserByIdFromDB = async (id: number): Promise<ServiceResponse> => {
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

// Update User Profile
export const updateUserInDB = async (id: number, userData: any): Promise<ServiceResponse> => {
    const fields = [];
    const values = [];
    let index = 1;

    if (userData.first_name) {
        fields.push(`first_name = $${index}`);
        values.push(userData.first_name);
        index++;
    }
    if (userData.last_name) {
        fields.push(`last_name = $${index}`);
        values.push(userData.last_name);
        index++;
    }
    if (userData.email) {
        fields.push(`email = $${index}`);
        values.push(userData.email);
        index++;
    }
    if (userData.phone_number) {
        fields.push(`phone_number = $${index}`);
        values.push(userData.phone_number);
        index++;
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
    return { error: false, message: "Profile updated", data: result.rows[0] };
};

// Delete User by ID
export const deleteUserFromDB = async (id: number): Promise<ServiceResponse> => {
    const result = await pool.query(`DELETE FROM users WHERE users_id = $1 RETURNING users_id`, [id]);
    return { error: false, message: "User deleted", data: result.rows[0] };
};

// Get User By Email From DB
export const getUserByEmailFromDB = async (email: string): Promise<ServiceResponse> => {
    const result = await pool.query(
        `SELECT users_id, first_name, last_name, email, phone_number, role, status, created_at, updated_at 
         FROM users WHERE email = $1`,
        [email]
    );
    return { error: false, message: "User found", data: result.rows[0] };
};
