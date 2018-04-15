import * as moment from 'moment';

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
    startDate: string;
    endDate: string;
    colorDisplay: string;

    constructor(json: any) {
        this.id = json.id;
        this.name = json.name;
        this.amount = Number(json.amount);
        this.budgetFrequency = json.budget_frequency;
        this.startDate = json.start_date;
        this.endDate = json.end_date;
        this.colorDisplay = json.color_display;
    }

    isActive(): boolean {
        const now = moment().format('YYYY-MM-DD');
        return !(this.startDate && this.endDate) || this.startDate <= now && now <= this.endDate;
    }

    isActiveForMonth(): boolean {
        if (!(this.startDate && this.endDate)) {
            return true;
        }

        const currentMonth = moment().format('MM');
        const startMonth = moment(this.startDate, 'YYYY-MM-DD').format('MM');
        const endMonth = moment(this.endDate, 'YYYY-MM-DD').format('MM');
        return startMonth === currentMonth || endMonth === currentMonth;
    }

}
