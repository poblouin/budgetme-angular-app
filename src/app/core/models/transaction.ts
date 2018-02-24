import { TransactionCategory } from './transaction-category';

export class Transaction {
    id: number;
    amount: number;
    date: string;
    description: string;
    transactionCategory: TransactionCategory;

    constructor(jsonObj: any) {
        this.id = jsonObj.id;
        this.amount = Number(jsonObj.amount);
        this.date = jsonObj.date;
        this.description = jsonObj.description;
        this.transactionCategory = jsonObj.transaction_category;
    }
}
