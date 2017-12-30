import * as moment from 'moment';

import { Period, PeriodEnum } from '../types';
import { Constant } from '../../shared/constants';

export class BudgetPeriod {

    private _periodStart: string;
    public get periodStart(): string {
        return this._periodStart;
    }

    private _periodEnd: string;
    public get periodEnd(): string {
        return this._periodEnd;
    }

    constructor(period: Period) {
        this.setPeriodDatesFromPeriod(period);
    }

    private setPeriodDatesFromPeriod(period: Period): void {
        const now = moment();
        let queryStr;

        if (period === PeriodEnum.weekly) {
            queryStr = 'isoWeek';
        } else if (period === PeriodEnum.monthly) {
            queryStr = 'month';
        }
        this._periodStart = now.startOf(queryStr).format(Constant.DATE_FORMAT);
        this._periodEnd = now.endOf(queryStr).format(Constant.DATE_FORMAT);
    }

}
