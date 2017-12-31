import { Component, OnInit, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import * as moment from 'moment';

import { BudgetPeriod } from './models/budget-period';
import { Period, PeriodEnum } from './types';
import { DashService } from './dash.service';
import { Budget } from '../core/models/budget';
import { BudgetService } from '../core/services/budget.service';


@Component({
    selector: 'dash-heading',
    templateUrl: './dash-heading.component.html'
})
export class DashHeadingComponent implements OnInit, OnDestroy {
    private budgetSub: ISubscription;
    private budgetTotalSub: ISubscription;

    public periods = [
        PeriodEnum.weekly,
        PeriodEnum.monthly
    ];
    public budgets: Array<Budget>;
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
            budgets => this.budgets = budgets
            );
        this.budgetTotalSub = this.dashService.budgetTotal
            .subscribe(
            budgetTotal => this.budgetTotalFormatted = `${budgetTotal} $`
            );
    }

    ngOnDestroy(): void {
        this.budgetSub.unsubscribe();
        this.budgetTotalSub.unsubscribe();
    }

    onChangeSelectedPeriod(newValue?: string) {
        this.dashService.setBudgetPeriod(this.selectedPeriod)
            .subscribe(
            budgetPeriod => this.budgetPeriod = budgetPeriod
            );
    }

}
