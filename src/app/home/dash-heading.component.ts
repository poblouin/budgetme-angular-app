import { Component, OnInit, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import * as moment from 'moment';

import { Constant } from '../shared/constants';
import { Budget } from '../core/models/budget';
import { BudgetService } from '../core/services/budget.service';


@Component({
    selector: 'dash-heading',
    templateUrl: './dash-heading.component.html'
})
export class DashHeadingComponent implements OnInit, OnDestroy {
    private budgetSub: ISubscription;

    public periods = [
        'Weekly',
        // 'Montly'
    ];
    public budgets: Array<Budget>;
    public budgetTotal: number;
    public budgetTotalFormatted: string;
    public selectedPeriod: string;
    public periodStart: string;
    public periodEnd: string;

    constructor(
        private budgetService: BudgetService
    ) { }

    ngOnInit(): void {
        this.setDefaultSelectedPeriod();
        this.budgetSub = this.budgetService.budgets
            .subscribe(
            budgets => {
                this.budgets = budgets;
                this.onChangeSelectedPeriod();
            });
    }

    ngOnDestroy(): void {
        this.budgetSub.unsubscribe();
    }

    onChangeSelectedPeriod(newValue?: string) {
        this.calculateTotal();
        this.setPeriodDates();
    }

    // TODO: Calculate Montly
    private calculateTotal(): void {
        let total = 0;
        this.budgets.forEach(budget => {
            total += budget.weekly_amount;
        });
        this.budgetTotal = total;
        this.budgetTotalFormatted = `${total} $`;
    }

    private setDefaultSelectedPeriod(): void {
        this.selectedPeriod = this.periods[0];
    }

    private setPeriodDates(): void {
        const now = moment();
        if (this.selectedPeriod === 'Weekly') {
            this.periodStart = now.startOf('isoWeek').format(Constant.DATE_FORMAT);
            this.periodEnd = now.endOf('isoWeek').format(Constant.DATE_FORMAT);
        }
    }

}
