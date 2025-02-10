import { Request, Response } from 'express';
import { addressModel } from '../models/addressModel';
import { successResponse, errorResponse } from '../helpers/responseHelper';

const addObj = new addressModel();

import { error } from 'console';

export const getUserAddressesId = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const addresses = await addObj.getAddressesFromDBbyID(userId);
        if (addresses.error) {
             res.status(500).json(addresses); return
        }
        res.status(200).json(successResponse("Users Addresses",addresses.data));

    } catch (err) {
        res.status(500).json(errorResponse("Users Addresses not found",error));
    }
};

export const getUserAddresses = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const result = await addObj.getAddressesFromDB(userId);

        if (result.error || result.data === null || (Array.isArray(result.data) && result.data.length === 0)) {
             res.status(result.error ? 500 : 404).json(result); return
        }
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json(errorResponse("Error fetching addresses",err));
    }
};

export const getUserAddressesById = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const result = await addObj.getAddressesFromDBbyID(userId);

        if (result.error) {
            return res.status(500).json(result);
        }
        res.status(result.data ? 200 : 404).json(result);
    } catch (error) {
        res.status(500).json(errorResponse("Error fetching address by ID",error));
    }
};

export const addAddress = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { full_address, state, city, zip_code } = req.body;

        const result = await addObj.addAddressToDB(userId, full_address, state, city, zip_code);
        res.status(result.error ? 500 : 201).json(result);
    } catch (err) {
        res.status(500).json(errorResponse("Error adding address",err));
    }
};

export const updateAddress = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const addressId = Number(req.params.id);
        
        if (Object.keys(req.body).length === 0) {
            res.status(400).json({ error: true, message: "No fields provided for update", data: null });
            return;
        }
        const result = await addObj.updateAddressInDB(userId, addressId, req.body);
        res.status(result.error ? 500 : 200).json(result);
    } catch (err) {
        res.status(500).json(errorResponse("Error updating address",err));
    }
};

export const deleteAddress = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const addressId = Number(req.params.id);
        const result = await addObj.deleteAddressFromDB(userId, addressId);
        res.status(result.error ? 500 : 200).json(result);
    } catch (err) {
        res.status(500).json(errorResponse("Error deleting address",err));
    }
};

export const setDefaultAddress = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const addressId = Number(req.params.id);
        const result = await addObj.setDefaultAddressInDB(userId, addressId);
        res.status(result.error ? 500 : 200).json(result);
    } catch (err) {
        res.status(500).json(errorResponse("Error setting default address",err));
    }
};
