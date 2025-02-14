import pool from '../config/db';
import { db } from './db';
import { orderItemsModel } from './orderItemsModel';
import { returnItemDetails } from './returnItemDetails';

const returnObj = new returnItemDetails();
const returnItemObjs =new orderItemsModel();
interface ServiceResponse {
    error: boolean;
    message: string;
    data: any;
}
export class returnModel extends db {

    public table: string = 'item_return';
    public uniqueField: string = 'order_items_id';
    constructor() {
        super(); 
    }

async requestReturn  (orderItemId: number, returnReason: string): Promise<ServiceResponse>  {
    try {
     const data = {
        order_items_id:orderItemId,
        return_Reason:returnReason,
    };
        const result2 = await this.insertRecord(data)
        return { error: false, message: "Return request placed", data: result2};
    } catch (err) {
        return { error: true, message: "Error placing return request", data: err };
    }
};

async processReturnRequest  (userId: number, orderItemId: number, quantity: number, returnReason: string): Promise<ServiceResponse>  {
    try {
        const orderValid = await returnItemObjs.checkUserOrderStatus(userId, orderItemId);
        if (!orderValid) {
            return { error: true, message: "You can only return items from your placed orders.", data: null };
        }
        const orderedQuantity = await returnItemObjs.getOrderedQuantity(orderItemId);
        const alreadyReturnedQuantity = await returnObj.getReturnedQuantity(orderItemId);
        if (alreadyReturnedQuantity + quantity > orderedQuantity) {
            return {
                error: true,
                message: `You have already returned ${alreadyReturnedQuantity} items. You can only return ${orderedQuantity - alreadyReturnedQuantity} more.`,
                data: null
            };
        }
        const returnRequest = await this.requestReturn(orderItemId, returnReason);
        if (returnRequest.error) {
            return returnRequest; 
        }
        const returnItemDetails = await returnObj.addReturnItemDetails(returnRequest.data.item_return_id, orderItemId, quantity);
        if (returnItemDetails.error) {
            return returnItemDetails; 
        }
        return {
            error: false,
            message: "Return request placed successfully, waiting for admin approval.",
            data: returnRequest.data
        };
    } catch (error) {
        console.error("Error processing return request in model:", error);
        return { error: true, message: "Error processing return", data: null };
    }
};

// Approve return & update refund in item_return
async approveReturnRequest  (returnItemId: number, refundAmount: number): Promise<boolean>  {
    try {
          let data ={
             return_status:2, total_amount:refundAmount
          }
          console.log(data)
        const result = await this.updateRecord(returnItemId,data);
      console.log("dd"+result)
        if (result) {
            return true;
        }
        return false;
    } catch (err) {
        return false;
    }
};

async processReturnApproval  (returnItemId: number): Promise<ServiceResponse> {
    try {
        const refundAmount = await returnObj.calculateRefundAmount(returnItemId);
        console.log(refundAmount)
        if (refundAmount === 0) { 
            return { error: true, message: "Refund calculation failed.", data: null };
        }

        const isApproved = await this.approveReturnRequest(returnItemId, refundAmount);
        console.log(isApproved)
        if (!isApproved) {
            return { error: true, message: "Return approval failed.", data: null };
        }

        await returnObj.updateStockAfterReturn(returnItemId);

        return {
            error: false,
            message: "Return request approved. Refund processed.",
            data: { refundAmount }
        };

    } catch (error) {
        console.error("Error processing return approval in model:", error);
        return { error: true, message: "Error approving return", data: null };
    }
};










































async getUserReturnedItems  (userId: number): Promise<ServiceResponse>  {
    try {
        const result = await pool.query(
    `SELECT 
    rid.Return_items_Id, 
    p.Product_name, 
    rid.Quantity, 
    rid.Return_status, 
    (rid.Quantity * rid.Price) AS Total_amount
FROM Return_item_details rid
JOIN Products p ON rid.Products_Id = p.Products_Id
JOIN Order_items oi ON rid.Order_items_Id = oi.Order_items_Id
JOIN Orders o ON oi.Orders_Id = o.Orders_Id
WHERE o.Users_Id = $1;
`,[userId]
        );
        return { error: false, message: "Returned items fetched", data: result.rows };
    } catch (err) {
        return { error: true, message: "Error fetching returned items", data: err };
    }
};
}