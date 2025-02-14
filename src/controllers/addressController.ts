import { Request, Response } from 'express';
import { addressModel } from '../models/addressModel';
import { helper } from '../helpers/responseHelper';

const objHelper  =  new helper();

const addObj = new addressModel();


export const getUserAddressesId = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const addresses = await addObj.getAddressesFromDB(userId);        if (addresses.error) {
            objHelper.error(res, 400, addresses.message); 
        }
        objHelper.success(res, addresses.message, addresses.data);
      } catch (error) {
        objHelper.error(res, 500, "Server Error");
      }
};

export const getUserAddresses = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const result = await addObj.getAddressesFromDB(userId);
        if (result.error || result.data === null || (Array.isArray(result.data) && result.data.length === 0)) {
            objHelper.error(res, 400, result.message);
        }
        objHelper.success(res, result.message, result.data);
      } catch (error) {
        objHelper.error(res, 500, "Server Error");
      }
};

export const getUserAddressesById = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const addresses = await addObj.getAddressesFromDB(userId);
        if (addresses.error) {
            objHelper.error(res, 400, addresses.message);
        }
        objHelper.success(res, addresses.message, addresses.data);
      } catch (error) {
        objHelper.error(res, 500, "Server Error");
      }
};

export const addAddress = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { full_address, state, city, zip_code } = req.body;
        const result = await addObj.addAddressToDB(userId, full_address, state, city, zip_code);
        console.log(result)
        if(result.error){
            objHelper.error(res, 400, result.message); return
        }
        objHelper.success(res, result.message, result.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
}


export const updateAddress = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const addressId = Number(req.params.id);
        if (Object.keys(req.body).length === 0) {
            res.status(400).json({ error: true, message: "No fields provided for update", data: null });
            return;
        }
        const result = await addObj.updateAddressInDB(userId, addressId, req.body);
        objHelper.success(res, result.message, result.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};

export const deleteAddress = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const addressId = Number(req.params.id);
        const result = await addObj.deleteAddressFromDB(userId, addressId);
        if(result.error){
            objHelper.error(res, 400, result.message);
        }
        objHelper.success(res, result.message, result.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};

export const setDefaultAddress = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const addressId = Number(req.params.id);
        const result = await addObj.setDefaultAddressInDB(userId, addressId);
        if(result.error){
            objHelper.error(res, 400, result.message);
        }
        objHelper.success(res, result.message, result.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};