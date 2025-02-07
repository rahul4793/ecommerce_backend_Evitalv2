import pool from '../config/db';

export const blacklistToken = async (token: string): Promise<void> => {
    await pool.query(`INSERT INTO token_blacklist (token) VALUES ($1)`, [token]);
};


export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
    const result = await pool.query(`SELECT token FROM token_blacklist WHERE token = $1`, [token]);
    return result.rows.length > 0;
    
};
