export enum BudgetFrequencyEnum {
    WEEKLY = 'Weekly',
    MONTHLY = 'Monthly'
}

export type BudgetFrequency = BudgetFrequencyEnum.WEEKLY | BudgetFrequencyEnum.MONTHLY;

export class Budget {
    id: number;
    name: string;
    amount: number;
    budgetFrequency: BudgetFrequencyEnum;

    constructor(json: any) {
        this.id = json.id;
        this.name = json.name;
        this.amount = Number(json.amount);
        this.budgetFrequency = json.budget_frequency;
    }
}
