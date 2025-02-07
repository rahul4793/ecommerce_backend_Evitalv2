import { Request, Response } from 'express';
import { 
    getAddressesFromDB, 
    addAddressToDB, 
    updateAddressInDB, 
    deleteAddressFromDB, 
    setDefaultAddressInDB, 
    getAddressesFromDBbyID 
} from '../models/addressModel';
import { error } from 'console';

export const getUserAddressesId = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const addresses = await getAddressesFromDBbyID(userId);
        if (addresses.error) {
             res.status(500).json(addresses); return
        }
        res.status(200).json({ error:false,message:"Users Addresses",data: addresses.data });
    } catch (err) {
        res.status(500).json({ error:true,message:"Users Addresses not found",data:error});
    }
};

export const getUserAddresses = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const result = await getAddressesFromDB(userId);

        if (result.error || result.data === null || (Array.isArray(result.data) && result.data.length === 0)) {
             res.status(result.error ? 500 : 404).json(result); return
        }

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: "Error fetching addresses", error: err });
    }
};

export const getUserAddressesById = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const result = await getAddressesFromDBbyID(userId);

        if (result.error) {
            return res.status(500).json(result);
        }
        
        res.status(result.data ? 200 : 404).json(result);
    } catch (error) {
        res.status(500).json({ message: "Error fetching address by ID", error: error });
    }
};

export const addAddress = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { full_address, state, city, zip_code } = req.body;

        const result = await addAddressToDB(userId, full_address, state, city, zip_code);
        res.status(result.error ? 500 : 201).json(result);
    } catch (err) {
        res.status(500).json({ message: "Error adding address", error: err });
    }
};

// export const updateAddress = async (req: Request, res: Response) => {
//     try {
//         const userId = (req as any).user?.userId;
//         const addressId = Number(req.params.id);
//         const { full_address, state, city, zip_code } = req.body;

//         const result = await updateAddressInDB(userId, addressId, full_address, state, city, zip_code);
//         res.status(result.error ? 500 : 200).json(result);
//     } catch (err) {
//         res.status(500).json({ message: "Error updating address", error: err });
//     }
// };
export const updateAddress = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const addressId = Number(req.params.id);
        
        if (Object.keys(req.body).length === 0) {
            res.status(400).json({ error: true, message: "No fields provided for update", data: null });
            return;
        }

        const result = await updateAddressInDB(userId, addressId, req.body);
        res.status(result.error ? 500 : 200).json(result);
    } catch (err) {
        res.status(500).json({ error: true, message: "Error updating address", data: err });
    }
};

export const deleteAddress = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const addressId = Number(req.params.id);

        const result = await deleteAddressFromDB(userId, addressId);
        res.status(result.error ? 500 : 200).json(result);
    } catch (err) {
        res.status(500).json({ message: "Error deleting address", error: err });
    }
};

export const setDefaultAddress = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const addressId = Number(req.params.id);

        const result = await setDefaultAddressInDB(userId, addressId);
        res.status(result.error ? 500 : 200).json(result);
    } catch (err) {
        res.status(500).json({ message: "Error setting default address", error: err });
    }
};
