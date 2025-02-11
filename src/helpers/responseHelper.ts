import { Response } from "express";

export interface ServiceResponse {
    error: boolean;
    message: string;
    data: any;
}

//to return success response
export const successResponse = (message: string, data: any = null): ServiceResponse => {
    return {
        error: false,
        message,
        data,
    };
};

//to return error response
export const errorResponse = (message: string, data: any = null): ServiceResponse => {
    return {
        error: true,
        message,
        data,
    };
};

export class helper {
 success   (res: Response, message: string, data: any)  {
    res.status(200).json({
       error: false,
       message,
       data,
   }); return;
};
 error  (res: Response, statusCode: number, message: string, data: any = null)  {
    res.status(statusCode).json({
       error: true,
       message,
       data,
   });return;
};

}