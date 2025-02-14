import { db } from './db';
import { feedbackModel } from './feedbackModel';

const feedObj  =  new feedbackModel();

export class discountModel extends db{
    public table: string = 'discounts';
    public uniqueField: string = 'discounts_id';

    constructor() {
        super();
        this.table = 'discounts'; 
        this.uniqueField = 'discounts_id';
    }


async getDiscount(discounts_id: number) {
    const discount = await this.selectRecord(discounts_id,"discount_type, discount_value")
    console.log(discount);
    return discount;
}

}