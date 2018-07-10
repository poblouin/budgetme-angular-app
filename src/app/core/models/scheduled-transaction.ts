import { TransactionCategory } from './transaction-category';

export enum ScheduledTransactionFrequencyEnum {
    DAILY = 'Daily',
    WEEKLY = 'Weekly',
    BI_WEEKLY = 'Bi-Weekly',
    MONTHLY = 'Monthly'
}

export type ScheduledTransactionFrequency =
    ScheduledTransactionFrequencyEnum.DAILY |
    ScheduledTransactionFrequencyEnum.WEEKLY |
    ScheduledTransactionFrequencyEnum.BI_WEEKLY |
    ScheduledTransactionFrequencyEnum.MONTHLY ;

export class ScheduledTransaction {
    id: number;
    amount: number;
    description: string;
    frequency: ScheduledTransactionFrequency;
    startDate: string;
    endDate: string;
    transactionCategory: TransactionCategory;

    constructor(jsonObj: any, transactionCategory: TransactionCategory) {
        this.id = jsonObj.id;
        this.amount = Number(jsonObj.amount);
        this.description = jsonObj.description;
        this.frequency = jsonObj.frequency;
        this.startDate = jsonObj.start_date;
        this.endDate = jsonObj.end_date;
        this.transactionCategory = transactionCategory;
    }
}
