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
