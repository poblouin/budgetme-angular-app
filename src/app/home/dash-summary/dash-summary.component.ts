import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { take } from 'rxjs/operators';
import { ISubscription } from 'rxjs/Subscription';

import { BaseChartDirective } from 'ng2-charts';
import { MatDialog } from '@angular/material/dialog';
import 'chart.piecelabel.js';

import { Budget } from '../../core/models/budget';
import { BudgetPeriod, TransactionDialogComponent } from 'app/shared';
import { DashService } from '../../core/services';


@Component({
    selector: 'dash-summary',
    templateUrl: './dash-summary.component.html'
})
export class DashSummaryComponent implements OnInit, OnDestroy {
    @ViewChild(BaseChartDirective) private _chart;
    private summaryTotalSub: ISubscription;
    private budgetTotalSub: ISubscription;

    private budgetTotal = 0;
    private budgetSpent = 0;

    public chartBudgetNames = new Array<string>();
    public chartBudgetTotal = new Array<string>();
    public chartOptions = {
        pieceLabel: {
            render: function (args) {
                return '$' + args.value;
            },
            fontColor: '#000',
            position: 'outside'
        },
        legend: {
            display: true,
            position: 'right',
        }
    };
    // TODO: Generate this considering the number of budget or limit number of budget. See DashService
    public chartColor: Array<any>;
    public budgetSpentFormatted: string;
    public budgetRemainingFormatted: string;

    constructor(
        private dashService: DashService,
        public dialog: MatDialog
    ) {
        this.chartColor = this.dashService.getChartColors();
    }

    ngOnInit(): void {
        this.budgetTotalSub = this.dashService.budgetTotal
            .subscribe(
                budgetTotal => {
                    this.budgetTotal = budgetTotal;
                    this.calculateBudgets();
                });

        this.summaryTotalSub = this.dashService.summaryTransactions.subscribe(
            data => {
                this.budgetSpent = 0;
                const budgetNames = new Array<string>();
                const budgetAmount = new Array<string>();
                data.forEach((amount, key) => {
                    const budgetName = this.dashService.getBudgetNameFromKey(key);
                    if (amount === 0) {
                        budgetNames.push(budgetName);
                    } else {
                        budgetNames.unshift(budgetName);
                        budgetAmount.unshift(amount.toFixed(2));
                        this.budgetSpent += amount;
                    }
                });
                this.chartBudgetNames = budgetNames;
                this.chartBudgetTotal = budgetAmount;
                this.forceChartRefresh();
                this.calculateBudgets();
            }
        );
    }

    ngOnDestroy(): void {
        this.summaryTotalSub.unsubscribe();
        this.budgetTotalSub.unsubscribe();
    }

    isRemainingNegative(): boolean {
        return (this.budgetTotal - this.budgetSpent) < 0;
    }

    createTransactionDialog(): void {
        const budgetPeriod: BudgetPeriod = this.dashService.getBudgetPeriod();
        this.dialog.open(TransactionDialogComponent, {
            width: 'auto',
            data: { periodStart: budgetPeriod.periodStart, periodEnd: budgetPeriod.periodEnd },
            disableClose: true
        });
    }

    private calculateBudgets(): void {
        this.budgetSpentFormatted = `${this.budgetSpent.toFixed(2)} $`;
        this.budgetRemainingFormatted = `${(this.budgetTotal - this.budgetSpent).toFixed(2)} $`;
    }

    private forceChartRefresh() {
        setTimeout(() => {
            if (this._chart !== undefined) {
                this._chart.refresh();
            }
        }, 10);
    }

}
