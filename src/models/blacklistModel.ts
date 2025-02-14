import pool from '../config/db';
import { errorResponse, successResponse } from '../helpers/responseHelper';
import { db } from './db';

export class blacklistModel extends db {
    public table: string = 'token_blacklist';
    public uniqueField: string = 'token';

    constructor() {
        super(); 
    }
    async isTokenBlacklisted(token: string) {
        this.where = `where token = '${token}'`; 
        const result = await this.allRecords(); 
        return result.length > 0;
      }
  
      async blacklistToken(token: string) {
          try {
              const result = await this.insertRecord({ token }); 
              return successResponse("Token blacklisted successfully", result.rows[0]); 
            } catch (error) {
            console.error("Error blacklisting token:", error);
            return errorResponse("Error blacklisting token", error); 
        }
    }
};