import { Budget } from './budget';

export class TransactionCategory {
    id: number;
    name: string;
    budget: Budget;

    constructor(jsonObj: any, budget: Budget) {
        this.id = jsonObj.id;
        this.name = jsonObj.name;
        this.budget = budget;
    }
}
