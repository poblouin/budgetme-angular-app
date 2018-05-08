import { Component, OnInit, OnDestroy } from '@angular/core';

import { SubscriptionLike as ISubscription } from 'rxjs';

import { BudgetService } from 'app/core/services/budget.service';
import { Budget } from 'app/core/models/budget';
import { DashService } from 'app/core';
import { PeriodEnum } from '../../shared/types';
import { BudgetFrequencyEnum } from '../../core/models/budget';
import { NgSwitchCase } from '@angular/common';

@Component({
    selector: 'dash-detailed',
    templateUrl: './dash-detailed.component.html'
})
export class DashDetailedComponent implements OnInit, OnDestroy {
    private subscriptions = new Array<ISubscription>();
    private budgets: Array<Budget>;

    public summaryTransactions: Map<string, number>;
    public detailedBudgets: Array<any>;
    public color = 'primary';
    public value = 60;

    constructor(
        private budgetService: BudgetService,
        public dashService: DashService
    ) { }

    ngOnInit() {
        this.subscriptions.push(this.dashService.summaryTransactions
            .filter(summaryTransactions => summaryTransactions.size > 0)
            .switchMap(
                summaryTransactions => {
                    this.summaryTransactions = summaryTransactions;
                    return this.budgetService.budgets;
                }
            )
            .filter(budgets => budgets.length > 0)
            .subscribe(
                budgets => {
                    this.budgets = budgets;
                    this.refreshBudgetCards();
                }
            )
        );

        this.subscriptions.push(this.budgetService.budgets.subscribe(
            budgets => this.budgets = budgets
        ));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        });
    }

    // TODO: This is ugly AF, but I did not manage to add the style with ngStyle directly in HTML.
    getBudgetClass(detailedBudget: any): any {
        if (Number(detailedBudget.percentageSpent) > 100) {
            return 'budget-red';
        }
        let colorClass = '';

        switch (detailedBudget.color) {
            case '#FF5722': {
                colorClass = 'budget-deep-orange';
                break;
            }
            case '#3F51B5': {
                colorClass = 'budget-indigo';
                break;
            }
            case '#2196F3': {
                colorClass = 'budget-blue';
                break;
            }
            case '#FFEB3B': {
                colorClass = 'budget-yellow';
                break;
            }
            case '#E91E63': {
                colorClass = 'budget-pink';
                break;
            }
            case '#673AB7': {
                colorClass = 'budget-deep-purple';
                break;
            }
            case '#03A9F4': {
                colorClass = 'budget-light-blue';
                break;
            }
            case '#FFC107': {
                colorClass = 'budget-amber';
                break;
            }
            case '#009688': {
                colorClass = 'budget-teal';
                break;
            }
            case '#4CAF50': {
                colorClass = 'budget-green';
                break;
            }
            case '8BC34A': {
                colorClass = 'budget-light-green';
                break;
            }
            case '##CDDC39': {
                colorClass = 'budget-lime';
                break;
            }
            case '#9C27B0': {
                colorClass = 'budget-purple';
                break;
            }
            case '#FF9800': {
                colorClass = 'budget-orange';
                break;
            }
            case '#00BCD4': {
                colorClass = 'budget-cyan';
                break;
            }
            case '#795548': {
                colorClass = 'budget-brown';
                break;
            }
        }

        return colorClass;
    }

    private refreshBudgetCards(): any {
        const newDetailedBudgets = new Array<any>();
        this.summaryTransactions.forEach((total, key) => {
            const budgetName = this.dashService.getBudgetNameFromKey(key);
            const budget = this.budgets.find(b => b.name === budgetName);
            const budgetTotal = this.getBudgetTotalForPeriod(budget);
            let percentageSpent = 100;
            if (budgetTotal !== 0) {
                percentageSpent = (total / budgetTotal) * 100;
            }

            newDetailedBudgets.push({
                name: budgetName,
                budgetFrequency: budget.budgetFrequency,
                startDate: budget.startDate,
                endDate: budget.endDate,
                color: budget.colorDisplay,
                totalSpent: total,
                budgetTotal: budgetTotal.toFixed(2),
                percentageSpent: percentageSpent.toFixed(2)
            });
        });

        this.detailedBudgets = newDetailedBudgets;
    }

    private getBudgetTotalForPeriod(budget: Budget) {
        const period = this.dashService.getSelectedPeriod();

        if (period === PeriodEnum.weekly && budget.budgetFrequency === BudgetFrequencyEnum.MONTHLY) {
            return (budget.amount * 12) / 52;
        } else if (period === PeriodEnum.monthly && budget.budgetFrequency === BudgetFrequencyEnum.WEEKLY) {
            const daysInMonth = this.dashService.getDaysInMonth();
            return (budget.amount / 7) * daysInMonth;
        }

        return budget.amount;
    }

}
