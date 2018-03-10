import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { ApiService } from '../../shared/services/api.service';
import { BudgetMeToastrService } from './toastr.service';
import { TransactionCategory } from 'app/core/models/transaction-category';

@Injectable()
export class TransactionCategoryService {
    private API_PATH = '/transaction-category';
    private _transactionCatSubject = new BehaviorSubject<Map<string, Array<TransactionCategory>>>(new Map());

    public transactionCategories = this._transactionCatSubject.asObservable();

    // TODO: When budget is deleted, delete the map[budgetName]
    constructor(
        private apiService: ApiService,
        private budgetMeToastrService: BudgetMeToastrService
    ) {
        this.getTransactionCategories();
    }

    getTransactionCategories(): void {
        const obs = this.apiService.get(this.API_PATH);
        obs.subscribe(
            data => {
                const newM = new Map<string, Array<TransactionCategory>>();
                data.transaction_categories.forEach(element => {
                    const budgetName = element.budget.name;
                    const transactionCat = new TransactionCategory(element);
                    if (newM.get(budgetName)) {
                        newM.get(budgetName).push(transactionCat);
                    } else {
                        newM.set(budgetName, new Array(transactionCat));
                    }
                });
                this._transactionCatSubject.next(newM);
            },
            err => this.budgetMeToastrService.showError(err)
        );
    }

    createTransactionCategory(saveTransactionCat: TransactionCategory): Observable<TransactionCategory> {
        return this.apiService.post(this.API_PATH, saveTransactionCat).map(
            data => {
                const transactionCategory = new TransactionCategory(data.transaction_category);
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
        );
    }

    updateTransactionCategory(updateTransactionCategory: TransactionCategory, oldbudgetName: string): Observable<TransactionCategory> {
        return this.apiService.put(this.API_PATH + `/${updateTransactionCategory.id}`, updateTransactionCategory).map(
            data => {
                const transactionCategory = new TransactionCategory(data.transaction_category);
                const newBudgetName = data.transaction_category.budget.name;
                oldbudgetName = oldbudgetName !== undefined ? oldbudgetName : newBudgetName;
                const transactionMap = this._transactionCatSubject.value;

                const index = transactionMap.get(oldbudgetName).findIndex(b => b.id === transactionCategory.id);
                if (newBudgetName === oldbudgetName) {
                    transactionMap.get(oldbudgetName)[index] = transactionCategory;
                } else {
                    transactionMap.get(oldbudgetName).splice(index, 1);
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
        );
    }

    deleteTransactionCategory(deleteTransactionCategory: TransactionCategory): Observable<TransactionCategory> {
        return this.apiService.delete(this.API_PATH + `/${deleteTransactionCategory.id}`).map(
            data => {
                const transactionMap = this._transactionCatSubject.value;
                const index = transactionMap.get(deleteTransactionCategory.budget.name)
                    .findIndex(b => b.id === deleteTransactionCategory.id);
                transactionMap.get(deleteTransactionCategory.budget.name).splice(index, 1);
                this._transactionCatSubject.next(transactionMap);
                this.budgetMeToastrService.showSuccess('Transaction category deleted');
                return data;
            }
        );
    }

}
