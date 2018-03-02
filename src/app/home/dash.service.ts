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
import { BudgetService, TransactionCategoryService, TransactionService, BudgetMeToastrService } from 'app/core';

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
        private transactionCatService: TransactionCategoryService,
        private transactionService: TransactionService,
        private budgetMeToastrService: BudgetMeToastrService
    ) {
        let init = true;
        this.budgetService.budgets.subscribe(
            budgets => {
                this.budgets = budgets;
                if (init) {
                    this.transactionService.getTransactions(
                        this.getBudgetNames(),
                        this.getBudgetPeriod().periodStart,
                        this.getBudgetPeriod().periodEnd
                    );
                    init = false;
                }
                this.calculateTotalTransactions();
                this.calculateBudgetTotal();
            }
        );
        this.transactionCatService.transactionCategories.subscribe(
            tranCats => {
                this.transactionCategories = tranCats;
                this.calculateTotalTransactions();
                this.calculateBudgetTotal();
            }
        );
        this.transactionService.transactions.subscribe(
            transactions => {
                this.calculateTotalTransactions();
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
        this.transactionService.getTransactions(
            this.getBudgetNames(),
            this.getBudgetPeriod().periodStart,
            this.getBudgetPeriod().periodEnd
        );
        this.calculateBudgetTotal();
        this.calculateTotalTransactions();
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

    private calculateTotalTransactions(): void {
        const period = this._selectedPeriodSubject.value;
        const transactionsPerBudget = this.transactionService.getTransactionsPerBudget();
        const newSummary = new Map<string, number>();

        transactionsPerBudget.forEach((transactions, budgetName) => {
            const budget = this.budgets.find(b => b.name === budgetName);
            if (budget === undefined) {
                const msg = 'Unexpected error while calculating the transactions, please try again.';
                this.budgetMeToastrService.showError(msg);
                Observable.throw(new Error(msg));
            }

            const key = this.createSummaryKey(budgetName);
            let total = 0;
            if (period === PeriodEnum.weekly && budget.budgetFrequency === BudgetFrequencyEnum.MONTHLY) {
                transactions.forEach(e => total += ((Number(e.amount)) * 12) / 52);
            } else {
                transactions.forEach(e => total += Number(e.amount));
            }
            newSummary.set(key, _.round(total, 2));
        });
        this._summaryTransactionsSubject.next(newSummary);
    }

    private createSummaryKey(budgetName: string): string {
        return [budgetName, this.getBudgetPeriod().periodStart, this.getBudgetPeriod().periodEnd].join('_');
    }

    private getBudgetNames(): Array<string> {
        return this.budgets.map(b => b.name);
    }

}
