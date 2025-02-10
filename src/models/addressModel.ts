import pool from '../config/db';
import { successResponse, errorResponse, ServiceResponse } from '../helpers/responseHelper';

export class addressModel {
    async getAddressesFromDB (userId: number) {
    try {
        const result = await pool.query(
            `SELECT * FROM addresses WHERE users_id = $1 ORDER BY is_default DESC, created_at DESC`,
            [userId]
        );
        if (result.rows.length === 0) {
        return errorResponse("No addresses found for the given user ID", null);
        }
        return successResponse("Addresses retrieved successfully", result.rows);
    } catch (error) {
        return errorResponse("Database error while fetching addresses", error);
    }
};



async getAddressesFromDBbyID  (userId: number) {
    return await this.getAddressesFromDB(userId);
};

async addAddressToDB  (userId: number, fullAddress: string, state: string, city: string, zipCode: string)  {
    try {
        const result = await pool.query(
            `INSERT INTO addresses (users_id, full_address, state, city, zip_code) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userId, fullAddress, state, city, zipCode]
        );
        return errorResponse("Address added successfully", result.rows[0]);
    } catch (error) {
        return errorResponse("Database error while adding address", error);
    }
};

async updateAddressInDB  (userId: number, addressId: number, updateData: any)  {
    try {
        const fields = [];
        const values = [];
        let index = 1;

        for (const key in updateData) {
            if (updateData[key] !== undefined && updateData[key] !== null) {
                fields.push(`${key} = $${index}`);
                values.push(updateData[key]);
                index++;
            }
        }

        if (fields.length === 0) {
            return errorResponse("No fields provided for update", null);
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        const query = `
            UPDATE addresses 
            SET ${fields.join(", ")}
            WHERE addresses_id = $${index} AND users_id = $${index + 1}
            RETURNING *`;

        values.push(addressId, userId);

        const result = await pool.query(query, values);
        return result.rows.length > 0
            ? { error: false, message: "Address updated successfully", data: result.rows[0] }
            : { error: true, message: "Address not found or update failed", data: null };
    } catch (error) {
        return errorResponse("Database error while updating address", error);
    }
};

async deleteAddressFromDB  (userId: number, addressId: number)  {
    try {
        const result = await pool.query(
            `DELETE FROM addresses WHERE addresses_id = $1 AND users_id = $2 RETURNING *`,
            [addressId, userId]
        );
        return result.rows.length > 0
            ? { error: false, message: "Address deleted successfully", data: null }
            : { error: true, message: "Address not found or already deleted", data: null };
    } catch (error) {
        return errorResponse("Database error while deleting address", error);
    }
};

async setDefaultAddressInDB  (userId: number, addressId: number)  {
    try {
        await pool.query(`UPDATE addresses SET is_default = FALSE WHERE users_id = $1`, [userId]);
        await pool.query(`UPDATE addresses SET is_default = TRUE WHERE addresses_id = $1 AND users_id = $2`, [addressId, userId]);
        await pool.query(`UPDATE users SET default_address_id = $1 WHERE users_id = $2`, [addressId, userId]);
        return successResponse("Default address updated successfully", null);

    } catch (error) {
        return errorResponse("Database error while setting default address", error);
    }
};
}