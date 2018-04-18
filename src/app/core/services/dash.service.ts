import { Injectable, OnDestroy } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as moment from 'moment';
import * as _ from 'lodash';

import { Constant } from '../../shared/constants';
import { Period, PeriodEnum } from '../../shared/types';
import { Budget, BudgetFrequencyEnum } from '../models/budget';
import { TransactionCategory } from '../models/transaction-category';
import { BudgetService } from './budget.service';
import { TransactionCategoryService } from './transaction-category.service';
import { TransactionService } from './transaction.service';
import { BudgetMeToastrService } from './toastr.service';
import { ApiService } from '../../shared/services/api.service';
import { BudgetPeriod } from '../../shared/models/budget-period';
import { ISubscription } from 'rxjs/Subscription';


@Injectable()
export class DashService implements OnDestroy {

    private subscriptions = new Array<ISubscription>();
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
        this.subscriptions.push(this.budgetService.budgets.subscribe(
            budgets => {
                this.budgets = budgets;
            }
        ));
        this.subscriptions.push(this.transactionCatService.transactionCategories.subscribe(
            tranCats => {
                this.transactionCategories = tranCats;
            }
        ));
        this.subscriptions.push(this.transactionService.transactions.subscribe(
            transactions => {
                this.calculateTotalTransactions();
                this.calculateBudgetTotal();
            }
        ));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        });
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
        this.subscriptions
            .push(this.transactionService.getTransactions(this.getBudgetPeriod().periodStart, this.getBudgetPeriod().periodEnd, true)
                .subscribe(
                    data => this.calculateBudgetTotal()
                ));
    }

    getBudgetNameFromKey(key: string): string {
        return key.split('_')[0];
    }

    getDaysInMonth(): number {
        return moment().daysInMonth();
    }

    // TODO: Refactor
    private calculateBudgetTotal(): void {
        const period = this._selectedPeriodSubject.value;
        let total = 0;

        if (period === PeriodEnum.weekly) {
            this.budgets.forEach(budget => {
                if (budget.isActiveForMonth()) {
                    if (budget.budgetFrequency === BudgetFrequencyEnum.WEEKLY) {
                        total += budget.amount;
                    } else if (budget.budgetFrequency === BudgetFrequencyEnum.MONTHLY) {
                        total += ((budget.amount * 12) / 52);
                    }
                }
            });
        } else if (period === PeriodEnum.monthly) {
            const daysInMonth = this.getDaysInMonth();
            this.budgets.forEach(budget => {
                if (budget.isActiveForMonth()) {
                    if (budget.budgetFrequency === BudgetFrequencyEnum.WEEKLY) {
                        total += ((budget.amount / 7) * daysInMonth);
                    } else if (budget.budgetFrequency === BudgetFrequencyEnum.MONTHLY) {
                        total += budget.amount;
                    }
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
