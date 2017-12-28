import { TransactionCategory } from './transaction-category';

export class Budget {
    name: String
    weeklyAmount: Number
    transactionCategories: Array<TransactionCategory>

    constructor(name, weekly_amount, transaction_categories) {
        this.name = name
        this.weeklyAmount = weekly_amount
        this.transactionCategories = transaction_categories
    }
}