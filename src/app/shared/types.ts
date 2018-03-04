export enum PeriodEnum {
    weekly = 'Weekly',
    monthly = 'Monthly',
    custom = 'Custom'
}

export type Period = PeriodEnum.weekly | PeriodEnum.monthly | PeriodEnum.custom;
