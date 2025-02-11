import { Request, Response } from 'express';
import {returnModel}  from '../models/returnModel'
import { helper } from '../helpers/responseHelper';
const returnObj = new returnModel();
const objHelper  =  new helper();
export const createReturnRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const { order_items_id, quantity, return_reason } = req.body;
        const result = await returnObj.processReturnRequest(userId, order_items_id, quantity, return_reason);
        if(result.error){
                   objHelper.error(res, 400, result.message);
               }
               objHelper.success(res, result.message, result.data);
           } catch (err) {
               objHelper.error(res, 500, "Server Error");
           }
       };
       

export const approveReturn = async (req: Request, res: Response): Promise<void> => {
    try {
        const { return_items_id } = req.body;
        const result = await returnObj.processReturnApproval(return_items_id);
        if(result.error){
            objHelper.error(res, 400, result.message);
        }
        objHelper.success(res, result.message, result.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};



export const getUserReturnHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const returnedItems = await returnObj.getUserReturnedItems(userId);
        if(returnedItems.error){
            objHelper.error(res, 400, returnedItems.message);
        }
        objHelper.success(res, returnedItems.message, returnedItems.data);
    } catch (err) {
        objHelper.error(res, 500, "Server Error");
    }
};

