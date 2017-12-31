import { take } from 'rxjs/operators';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { BaseChartDirective } from 'ng2-charts';
import 'chart.piecelabel.js';

import { DashService } from 'app/home/dash.service';
import { Budget } from '../../core/models/budget';


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

        this.summaryTotalSub = this.dashService.summaryTransactions
        .subscribe(
        data => {
            this.budgetSpent = 0;
            const budgetNames = new Array<string>();
            const budgetAmount = new Array<string>();
            data.forEach((amount, name) => {
                if (amount === 0) {
                    budgetNames.push(name);
                } else {
                    budgetNames.unshift(name);
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

    private calculateBudgets(): void {
        this.budgetSpentFormatted = `${this.budgetSpent.toFixed(2)} $`;
        this.budgetRemainingFormatted = `${(this.budgetTotal - this.budgetSpent).toFixed(2)} $`;
    }

    private forceChartRefresh() {
        setTimeout(() => {
            this._chart.refresh();
        }, 10);
    }

}
