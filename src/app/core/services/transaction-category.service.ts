
import { Injectable, OnDestroy } from '@angular/core';

import { filter,  map } from 'rxjs/operators';
import { BehaviorSubject ,  Observable ,  SubscriptionLike as ISubscription } from 'rxjs';

import { ApiService } from '../../shared/services/api.service';
import { BudgetMeToastrService } from './toastr.service';
import { TransactionCategory } from 'app/core/models/transaction-category';
import { BudgetService } from './budget.service';
import { Budget } from '../models/budget';

const API_PATH = '/transaction-category';
@Injectable()
export class TransactionCategoryService implements OnDestroy {

    private subscriptions = new Array<ISubscription>();
    private budgets: Array<Budget>;
    private _transactionCatSubject = new BehaviorSubject<Map<string, Array<TransactionCategory>>>(new Map());

    public transactionCategories = this._transactionCatSubject.asObservable();

    constructor(
        private apiService: ApiService,
        private budgetMeToastrService: BudgetMeToastrService,
        private budgetService: BudgetService
    ) {
        this.subscriptions.push(this.budgetService.budgets.pipe(
            filter(budgets => budgets.length > 0))
            .subscribe(
                budgets => {
                    this.budgets = budgets;
                    this.subscriptions.push(this.getTransactionCategories(true).subscribe());
                }
            ));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        });
    }

    getTransactionCategories(isInit?: boolean): Observable<Map<string, Array<TransactionCategory>>> {
        if (isInit) {
            return this.apiService.get(API_PATH).pipe(
                map(
                    data => {
                        const newM = new Map<string, Array<TransactionCategory>>();
                        data.transaction_categories.forEach(element => {
                            const budgetName = element.budget.name;
                            const budget = this.budgets.find(b => b.id === element.budget.id);
                            const transactionCat = new TransactionCategory(element, budget);
                            if (newM.get(budgetName)) {
                                newM.get(budgetName).push(transactionCat);
                            } else {
                                newM.set(budgetName, new Array(transactionCat));
                            }
                        });
                        this.transactionCategories = this._transactionCatSubject.asObservable();
                        this._transactionCatSubject.next(newM);
                        return newM;
                    },
                    err => this.budgetMeToastrService.showError(err)
                ));
        } else {
            return this.transactionCategories;
        }
    }

    createTransactionCategory(saveTransactionCat: TransactionCategory): Observable<TransactionCategory> {
        return this.apiService.post(API_PATH, saveTransactionCat).pipe(map(
            data => {
                const newTransactionCategory = data.transaction_category;
                const budget = this.budgets.find(b => b.id === newTransactionCategory.budget.id);
                const transactionCategory = new TransactionCategory(newTransactionCategory, budget);
                const budgetName = transactionCategory.budget.name;
                const transactionMap = this._transactionCatSubject.value;

                if (transactionMap.has(budgetName)) {
                    transactionMap.get(budgetName).push(transactionCategory);
                } else {
                    transactionMap.set(budgetName, new Array(transactionCategory));
                }

                this._transactionCatSubject.next(transactionMap);
                this.budgetMeToastrService.showSuccess('Transaction category created');
                return transactionCategory;
            }
        ));
    }

    updateTransactionCategory(updateTransactionCategory: TransactionCategory, oldBudgetName: string): Observable<TransactionCategory> {
        return this.apiService.put(API_PATH + `/${updateTransactionCategory.id}`, updateTransactionCategory).pipe(map(
            data => {
                const newTransactionCategory = data.transaction_category;
                const budget = this.budgets.find(b => b.id === newTransactionCategory.budget.id);
                const transactionCategory = new TransactionCategory(newTransactionCategory, budget);
                const newBudgetName = data.transaction_category.budget.name;
                oldBudgetName = oldBudgetName !== undefined ? oldBudgetName : newBudgetName;
                const transactionMap = this._transactionCatSubject.value;

                const index = transactionMap.get(oldBudgetName).findIndex(b => b.id === transactionCategory.id);
                if (newBudgetName === oldBudgetName) {
                    transactionMap.get(oldBudgetName)[index] = transactionCategory;
                } else {
                    transactionMap.get(oldBudgetName).splice(index, 1);
                    if (transactionMap.has(newBudgetName)) {
                        transactionMap.get(newBudgetName).push(transactionCategory);
                    } else {
                        transactionMap.set(newBudgetName, new Array(transactionCategory));
                    }
                }

                this._transactionCatSubject.next(transactionMap);
                this.budgetMeToastrService.showSuccess('Transaction category updated');
                return transactionCategory;
            }
        ));
    }

    deleteTransactionCategory(deleteTransactionCategory: TransactionCategory): Observable<TransactionCategory> {
        return this.apiService.delete(API_PATH + `/${deleteTransactionCategory.id}`).pipe(map(
            data => {
                const transactionMap = this._transactionCatSubject.value;
                const index = transactionMap.get(deleteTransactionCategory.budget.name)
                    .findIndex(b => b.id === deleteTransactionCategory.id);
                transactionMap.get(deleteTransactionCategory.budget.name).splice(index, 1);

                this._transactionCatSubject.next(transactionMap);
                this.budgetMeToastrService.showSuccess('Transaction category deleted');
                return data;
            }
        ));
    }

}
