import express from 'express';
import { authenticateUser, debounceMiddleware, isAdmin } from '../middleware/authMiddleware';
import validateRequest from '../middleware/validateRequest'; 
import {addressSchema,updateAddressjoi} from '../validations/addressVaalidation';
import { validateParams } from "../validations/routesValidation";

import { 
    getUserAddresses, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress ,
    getUserAddressesId
} from '../controllers/addressController';

const router = express.Router();

router.get('/',authenticateUser,getUserAddresses);
router.get('/userid/:id',authenticateUser,validateParams,isAdmin,getUserAddressesId);

router.post('/add',debounceMiddleware(300),authenticateUser,validateRequest(addressSchema),addAddress);
router.put('/update/:id',authenticateUser,validateParams,validateRequest(updateAddressjoi),updateAddress);
router.delete('/delete/:id',authenticateUser,validateParams,deleteAddress);
router.put('/setdefault/:id',debounceMiddleware(300),authenticateUser,validateParams,setDefaultAddress);

export default router;