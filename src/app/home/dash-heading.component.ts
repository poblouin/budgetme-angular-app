import { Component, OnInit, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import * as moment from 'moment';

import { BudgetPeriod } from './models/budget-period';
import { Period, PeriodEnum } from './types';
import { DashService } from './dash.service';
import { Budget } from '../core/models/budget';
import { BudgetService } from '../core/services/budget.service';
import * as _ from 'lodash';


@Component({
    selector: 'dash-heading',
    templateUrl: './dash-heading.component.html'
})
export class DashHeadingComponent implements OnInit, OnDestroy {
    private budgetSub: ISubscription;

    public periods = [
        PeriodEnum.weekly,
        PeriodEnum.monthly
    ];
    public budgets: Array<Budget>;
    public budgetTotal: number;
    public budgetTotalFormatted: string;
    public selectedPeriod: Period;
    public budgetPeriod: BudgetPeriod;

    constructor(
        private dashService: DashService,
        private budgetService: BudgetService
    ) { }

    ngOnInit(): void {
        this.selectedPeriod = this.dashService.getSelectedPeriod();
        this.budgetPeriod = this.dashService.getBudgetPeriod();
        this.budgetSub = this.budgetService.budgets
            .subscribe(
            budgets => {
                this.budgets = budgets;
                this.calculateTotal();
            });
    }

    ngOnDestroy(): void {
        this.budgetSub.unsubscribe();
    }

    onChangeSelectedPeriod(newValue?: string) {
        this.calculateTotal();
        this.dashService.setBudgetPeriod(this.selectedPeriod)
            .subscribe(
            budgetPeriod => this.budgetPeriod = budgetPeriod
            );
    }

    private calculateTotal(): void {
        let total = 0;

        if (this.selectedPeriod === PeriodEnum.weekly) {
            this.budgets.forEach(budget => {
                total += budget.weekly_amount;
            });
        } else if (this.selectedPeriod === PeriodEnum.monthly) {
            const daysInMonth = moment().daysInMonth();
            this.budgets.forEach(budget => {
                total += ((budget.weekly_amount / 7) * daysInMonth);
            });
            total = _.round(total, 2);
        }

        this.budgetTotal = total;
        this.budgetTotalFormatted = `${total} $`;
    }

}
