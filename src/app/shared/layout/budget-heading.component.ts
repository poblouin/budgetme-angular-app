import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import * as moment from 'moment';

import { PeriodEnum, Period } from '../types';
import { BudgetPeriod } from '../models/budget-period';
import { DashService } from '../../core/services';


@Component({
    selector: 'budget-heading',
    templateUrl: './budget-heading.component.html'
})
export class BudgetHeadingComponent implements OnInit, OnDestroy {
    private budgetTotalSub: ISubscription;

    @Input('showAmount') public showAmount = true;
    @Input('transactionTotalFormatted') public transactionTotalFormatted = '0.00 $';
    public periods = [
        PeriodEnum.weekly,
        PeriodEnum.monthly
    ];
    public budgetTotalFormatted: string;
    public selectedPeriod: Period;
    public budgetPeriod: BudgetPeriod;

    constructor(
        private dashService: DashService
    ) { }

    ngOnInit(): void {
        this.selectedPeriod = this.dashService.getSelectedPeriod();
        this.budgetPeriod = this.dashService.getBudgetPeriod();
        this.budgetTotalSub = this.dashService.budgetTotal.subscribe(
            budgetTotal => this.budgetTotalFormatted = `${budgetTotal.toFixed(2)} $`
        );
    }

    ngOnDestroy(): void {
        this.budgetTotalSub.unsubscribe();
    }

    onChangeSelectedPeriod(newValue?: string) {
        this.dashService.setBudgetPeriod(this.selectedPeriod).subscribe(
            budgetPeriod => this.budgetPeriod = budgetPeriod
        );
    }

}
