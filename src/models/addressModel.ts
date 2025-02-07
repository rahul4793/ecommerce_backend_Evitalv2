import pool from '../config/db';


export const getAddressesFromDB = async (userId: number) => {
    try {
        const result = await pool.query(
            `SELECT * FROM addresses WHERE users_id = $1 ORDER BY is_default DESC, created_at DESC`,
            [userId]
        );
        if (result.rows.length === 0) {
            return {
                error: true,
                message: "No addresses found for the given user ID",
                data: null,  
            };
        }
        return {
            error: false,
            message: "Addresses retrieved successfully",
            data: result.rows,
        };
    } catch (error) {
        return {
            error: true,
            message: "Database error while fetching addresses",
            data: error,
        };
    }
};



export const getAddressesFromDBbyID = async (userId: number) => {
    return await getAddressesFromDB(userId);
};

export const addAddressToDB = async (userId: number, fullAddress: string, state: string, city: string, zipCode: string) => {
    try {
        const result = await pool.query(
            `INSERT INTO addresses (users_id, full_address, state, city, zip_code) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userId, fullAddress, state, city, zipCode]
        );
        return { error: false, message: "Address added successfully", data: result.rows[0] };
    } catch (error) {
        return { error: true, message: "Database error while adding address", data: error };
    }
};

export const updateAddressInDB = async (userId: number, addressId: number, fullAddress: string, state: string, city: string, zipCode: string) => {
    try {
        const result = await pool.query(
            `UPDATE addresses 
             SET full_address = $1, state = $2, city = $3, zip_code = $4, updated_at = CURRENT_TIMESTAMP 
             WHERE addresses_id = $5 AND users_id = $6 RETURNING *`,
            [fullAddress, state, city, zipCode, addressId, userId]
        );
        return result.rows.length > 0
            ? { error: false, message: "Address updated successfully", data: result.rows[0] }
            : { error: true, message: "Address not found or update failed", data: null };
    } catch (error) {
        return { error: true, message: "Database error while updating address", data: error };
    }
};

export const deleteAddressFromDB = async (userId: number, addressId: number) => {
    try {
        const result = await pool.query(
            `DELETE FROM addresses WHERE addresses_id = $1 AND users_id = $2 RETURNING *`,
            [addressId, userId]
        );
        return result.rows.length > 0
            ? { error: false, message: "Address deleted successfully", data: null }
            : { error: true, message: "Address not found or already deleted", data: null };
    } catch (error) {
        return { error: true, message: "Database error while deleting address", data: error };
    }
};

export const setDefaultAddressInDB = async (userId: number, addressId: number) => {
    try {
        await pool.query(`UPDATE addresses SET is_default = FALSE WHERE users_id = $1`, [userId]);
        await pool.query(`UPDATE addresses SET is_default = TRUE WHERE addresses_id = $1 AND users_id = $2`, [addressId, userId]);
        await pool.query(`UPDATE users SET default_address_id = $1 WHERE users_id = $2`, [addressId, userId]);

        return { error: false, message: "Default address updated successfully", data: null };
    } catch (error) {
        return { error: true, message: "Database error while setting default address", data: error };
    }
};
