import { successResponse, errorResponse, ServiceResponse } from '../helpers/responseHelper';
import { db } from './db'; 

export class addressModel extends db { 
    public table: string = 'addresses';
    public uniqueField: string = 'addresses_id';

    constructor() {
        super(); 
    }
    async getAddressesFromDB(userId: number): Promise<ServiceResponse> {
        try {
            this.where = `WHERE users_id = ${userId} ORDER BY is_default DESC, created_at DESC`;
            const result = await this.allRecords(); 
            if (!result || result.length === 0) {
                return errorResponse("No addresses found for the given user ID", null);
            }
            return successResponse("Addresses retrieved successfully", result);
        } catch (error) {
            return errorResponse("Database error while fetching addresses", error);
        }
    };

    async getAddressesFromDBbyID(userId: number): Promise<ServiceResponse> {
        return await this.getAddressesFromDB(userId);
    };

    async addAddressToDB(userId: number, fullAddress: string, state: string, city: string, zipCode: string): Promise<ServiceResponse> {
        try {
            const data = {
                users_id: userId,
                full_address: fullAddress,
                state: state,
                city: city,
                zip_code: zipCode
            };
            const result = await this.insertRecord(data);
            if(result){
              return successResponse("Address added successfully", result);
            }else{
              return errorResponse("Database error while adding address", null);
            }
        } catch (error) {
            return errorResponse("Database error while adding address", error);
        }
    };

    async updateAddressInDB(userId: number, addressId: number, updateData: any): Promise<ServiceResponse> {
        try {
            this.where = `where addresses_id = ${addressId} AND users_id = ${userId}`;
            const result = await this.updateRecord(addressId,updateData);
            if (result > 0) {
                return successResponse("Address updated successfully", null);
            } else {
                return errorResponse("Address not found or update failed", null);
            }
        } catch (error) {
            return errorResponse("Database error while updating address", error);
        }
    };

    async deleteAddressFromDB(userId: number, addressId: number): Promise<ServiceResponse> {
        try {
            this.where = `addresses_id = ${addressId} AND users_id = ${userId}`;
            const result = await this.deleteRecord(addressId);
            if (result > 0) {
                return successResponse("Address deleted successfully", null);
            } else {
                return errorResponse("Address not found or already deleted", null);
            }
        } catch (error) {
            return errorResponse("Database error while deleting address", error);
        }
    };
async setDefaultAddressInDB(userId: number, addressId: number): Promise<ServiceResponse> {
    try {
        // Set all addresses for the user to NOT default (still need raw query)
        await this.update(this.table, { is_default: false }, `users_id = ${userId}`);

        // Set the specified address as the default (using updateRecord)
        await this.updateRecord(addressId, { is_default: true }); 

        // Update the users table with the default address ID (still need raw query)
        await this.update('users', { default_address_id: addressId }, `users_id = ${userId}`);

        return successResponse("Default address updated successfully", null);

    } catch (error) {
        return errorResponse("Database error while setting default address", error);
    }
};


async getUserAddress(userId: number, addressId?: number) {
    this.where = `WHERE users_id = ${userId} AND (addresses_id = ${addressId} OR is_default = TRUE)`;
    this.rpp =  1;this.orderby = `ORDER BY is_default DESC `
    const result = await this.listRecords("addresses_id");
    return result || null;
}


}