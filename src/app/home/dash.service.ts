import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as moment from 'moment';
import * as _ from 'lodash';

import { Constant } from '../shared/constants';
import { Period, PeriodEnum } from './types';
import { BudgetPeriod } from 'app/home/models/budget-period';
import { Budget, BudgetFrequencyEnum } from 'app/core/models/budget';
import { TransactionCategory } from 'app/core/models/transaction-category';
import { Transaction } from '../core/models/transaction';
import { ApiService } from 'app/shared';
import { BudgetService, TransactionCategoryService } from 'app/core';

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
    private _budgetTotal = new BehaviorSubject<number>(0);
    private _summaryTransactionsSubject = new BehaviorSubject<Map<string, number>>(new Map());
    private budgets: Array<Budget>;
    private transactionCategories: Map<string, Array<TransactionCategory>>;

    public readonly budgetPeriod = this._budgetPeriodSubject.asObservable();
    public readonly selectedPeriod = this._selectedPeriodSubject.asObservable().distinctUntilChanged();
    public readonly budgetTotal = this._budgetTotal.asObservable().distinctUntilChanged();
    public readonly summaryTransactions = this._summaryTransactionsSubject.asObservable();

    constructor(
        private apiService: ApiService,
        private budgetService: BudgetService,
        private transactionCatService: TransactionCategoryService
    ) {
        this.budgetService.budgets
            .subscribe(
            budgets => {
                this.budgets = budgets;
                this.getSummaryTransactions();
                this.calculateBudgetTotal();
            }
            );
        this.transactionCatService.transactionCategories
            .subscribe(
                tranCats => {
                    this.transactionCategories = tranCats;
                    this.getSummaryTransactions();
                    this.calculateBudgetTotal();
                }
            );
    }

    getBudgetPeriod(): BudgetPeriod {
        return this._budgetPeriodSubject.value;
    }

    setBudgetPeriod(period: Period): Observable<BudgetPeriod> {
        const bp = new BudgetPeriod(period);
        this._budgetPeriodSubject.next(bp);
        this.setSelectedPeriod(period);
        return Observable.of(bp);
    }

    getSelectedPeriod(): Period {
        return this._selectedPeriodSubject.value;
    }

    setSelectedPeriod(newPeriod: Period): void {
        this._selectedPeriodSubject.next(newPeriod);
        this.calculateBudgetTotal();
    }

    getSummaryTransactions(): void {
        const sources = [];
        const keys = [];

        this.budgets.forEach(e => {
            const param = new URLSearchParams();
            param.set('budget_name', e.name);
            param.set('from_date', this.getBudgetPeriod().periodStart);
            param.set('to_date', this.getBudgetPeriod().periodEnd);
            sources.push(this.apiService.get('/transaction', param));
            keys.push(this.createSummaryKey(e.name));
        });

        if (sources.length === 0) { return; }
        Observable.forkJoin(sources)
            .subscribe(
            (res: any) => {
                const summary = new Map<string, number>();
                for (let i = 0; i < res.length; i++) {
                    const obj = res[i];
                    summary.set(keys[i], this.calculateTotalTransactions(obj.transactions));
                }
                this._summaryTransactionsSubject.next(summary);
            });
    }

    getChartColors(): Array<any> {
        return [{ backgroundColor: _.shuffle(this.backgroundColor) }];
    }

    getBudgetNameFromKey(key: string): string {
        return key.split('_')[0];
    }

    private calculateBudgetTotal(): void {
        const period = this._selectedPeriodSubject.value;
        let total = 0;

        if (period === PeriodEnum.weekly) {
            this.budgets.forEach(budget => {
                if (budget.budgetFrequency === BudgetFrequencyEnum.WEEKLY) {
                    total += budget.amount;
                } else if (budget.budgetFrequency === BudgetFrequencyEnum.MONTHLY) {
                    total += ((budget.amount * 12) / 52);
                }
            });
        } else if (period === PeriodEnum.monthly) {
            const daysInMonth = moment().daysInMonth();
            this.budgets.forEach(budget => {
                if (budget.budgetFrequency === BudgetFrequencyEnum.WEEKLY) {
                    total += ((budget.amount / 7) * daysInMonth);
                } else if (budget.budgetFrequency === BudgetFrequencyEnum.MONTHLY) {
                    total += budget.amount;
                }
            });
        }

        this._budgetTotal.next(_.round(total, 2));
    }

    // TODO: Transaction in monthly budget -> week.
    private calculateTotalTransactions(transactions: Array<Transaction>): number {
        let total = 0;
        transactions.forEach(e => total += Number(e.amount));
        return _.round(total, 2);
    }

    private createSummaryKey(budgetName: string): string {
        return [budgetName, this.getBudgetPeriod().periodStart, this.getBudgetPeriod().periodEnd].join('_');
    }

}
