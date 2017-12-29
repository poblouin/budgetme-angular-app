import { Component, OnInit, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import { Budget } from '../core/models/budget';
import { BudgetService } from '../core/services/budget.service';


@Component({
    selector: 'dash-heading',
    templateUrl: './dash-heading.component.html'
})
export class DashHeadingComponent implements OnInit, OnDestroy {
    private budgetSub: ISubscription;

    public budgets: Array<Budget>;
    public weeklyTotal: number;

    constructor(
        private budgetService: BudgetService
    ) { }

    ngOnInit(): void {
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

    private calculateTotal(): void {
        let total = 0;
        this.budgets.forEach(budget => {
            total += budget.weekly_amount;
        });
        this.weeklyTotal = total;
    }
}
