import { Transaction } from '../core/models/transaction';
import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Constant } from '../shared/constants';
import { Period } from './types';
import { BudgetPeriod } from 'app/home/models/budget-period';
import { Observable } from 'rxjs/Observable';
import { BudgetService } from 'app/core';
import { Budget } from 'app/core/models/budget';
import { ApiService } from 'app/shared';
import * as _ from 'lodash';

@Injectable()
export class DashService {

    // Material Palette Colors.
    // TODO: Generate this considering the number of budget or limit number of budget.
    private backgroundColor = [
        '#FF5722', // Deep Orange
        '#3F51B5', // Indigo
        '#2196F3', // Blue
        '#F44336', // Red
        '#FFEB3B', // Yellow
        '#E91E63', // Pink
        '#673AB7', // Deep purple
        '#03A9F4', // Light Blue
        '#FFC107', // Amber
        '#009688', // Teal
        '#4CAF50', // Green
        '#8BC34A', // Light Green
        '#CDDC39', // Lime
        '#9C27B0', // Purple
        '#FF9800', // Orange
        '#00BCD4', // Cyan
        '#795548'  // Brown
    ];
    private _budgetPeriodSubject = new BehaviorSubject<BudgetPeriod>(new BudgetPeriod(Constant.DEFAULT_PERIOD));
    private _selectedPeriodSubject = new BehaviorSubject<Period>(Constant.DEFAULT_PERIOD);
    private _summaryTransactionsSubject = new BehaviorSubject<Map<string, number>>(new Map());
    private budgets: Array<Budget>;

    public readonly budgetPeriod = this._budgetPeriodSubject.asObservable();
    public readonly selectedPeriod = this._selectedPeriodSubject.asObservable().distinctUntilChanged();
    public readonly summaryTransactions = this._summaryTransactionsSubject.asObservable();

    constructor(
        private apiService: ApiService,
        private budgetService: BudgetService
    ) {
        this.budgetService.budgets
            .subscribe(
            budgets => {
                this.budgets = budgets;
                this.getSummaryTransactions();
            }
            );
    }

    getBudgetPeriod(): BudgetPeriod {
        return this._budgetPeriodSubject.value;
    }

    setBudgetPeriod(period: Period): Observable<BudgetPeriod> {
        const bp = new BudgetPeriod(period);
        this._budgetPeriodSubject.next(bp);
        return Observable.of(bp);
    }

    getSelectedPeriod(): Period {
        return this._selectedPeriodSubject.value;
    }

    setSelectedPeriod(newPeriod: Period): void {
        this._selectedPeriodSubject.next(newPeriod);
    }

    getSummaryTransactions(): void {
        const sources = [];
        const budgetNames = [];

        this.budgets.forEach(e => {
            const param = new URLSearchParams();
            param.set('budget_name', e.name);
            param.set('from_date', this.getBudgetPeriod().periodStart);
            param.set('to_date', this.getBudgetPeriod().periodEnd);
            sources.push(this.apiService.get('/transaction', param));
            budgetNames.push(e.name);
        });

        if (sources.length === 0) { return; }
        Observable.forkJoin(sources)
            .subscribe(
            (res: any) => {
                const summary = new Map<string, number>();
                for (let i = 0; i < res.length; i++) {
                    const obj = res[i];
                    summary.set(budgetNames[i], this.calculateTotalTransactions(obj.transactions));
                }
                this._summaryTransactionsSubject.next(summary);
            });
    }

    getChartColors(): Array<any> {
        return [{ backgroundColor: _.shuffle(this.backgroundColor) }];
    }

    private calculateTotalTransactions(transactions: Array<Transaction>): number {
        let total = 0;
        transactions.forEach(e => total += Number(e.amount));
        return _.round(total, 2);
    }

}
