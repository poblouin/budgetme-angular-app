import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { ApiService } from '../../shared/services/api.service';
import { BudgetMeToastrService } from './toastr.service';
import { Budget } from '../models/budget';
import { TransactionService } from './transaction.service';
import { ISubscription } from 'rxjs/Subscription';
import { map } from 'rxjs/operators';

const API_PATH = '/budget';

@Injectable()
export class BudgetService implements OnDestroy {
    private budgetSub: ISubscription;
    private _budgetSubject = new BehaviorSubject<Array<Budget>>(new Array<Budget>());

    public budgets = this._budgetSubject.asObservable();

    constructor(
        private apiService: ApiService,
        private budgetMeToastrService: BudgetMeToastrService,
        private transactionService: TransactionService
    ) {
        this.budgetSub = this.getBudgets(true).subscribe();
    }

    ngOnDestroy(): void {
        this.budgetSub.unsubscribe();
    }

    getBudgets(isInit?: boolean): Observable<Array<Budget>> {
        if (isInit) {
            return this.apiService.get(API_PATH)
                .map(
                data => {
                    const arr = new Array<Budget>();
                    data.budgets.forEach(element => {
                        arr.push(new Budget(element));
                    });
                    this.budgets = this._budgetSubject.asObservable();
                    this._budgetSubject.next(arr);
                    return arr;
                },
                err => this.budgetMeToastrService.showError(err)
            );
        } else {
            return this.budgets;
        }
    }

    createBudget(saveBudget: Budget): Observable<Budget> {
        return this.apiService.post(API_PATH, saveBudget).map(
            data => {
                const budget = new Budget(data.budget);
                const arr = this._budgetSubject.value;
                arr.push(budget);
                this._budgetSubject.next(arr);
                this.budgetMeToastrService.showSuccess('Budget created');
                return budget;
            }
        );
    }

    updateBudget(updateBudget: Budget, oldBudgetName: string): Observable<Budget> {
        return this.apiService.put(API_PATH + `/${updateBudget.id}`, updateBudget).map(
            data => {
                const budget = new Budget(data.budget);
                const arr = this._budgetSubject.value;
                const index = arr.findIndex(b => b.id === updateBudget.id);
                arr[index] = budget;
                this.transactionService.updateTransactionCacheOnBudgetChange(oldBudgetName, budget.name);
                this._budgetSubject.next(arr);
                this.budgetMeToastrService.showSuccess('Budget updated');
                return budget;
            }
        );
    }

    deleteBudget(deleteBudget: Budget): Observable<Budget> {
        return this.apiService.delete(API_PATH + `/${deleteBudget.id}`).map(
            data => {
                const arr = this._budgetSubject.value;
                const index = arr.findIndex(b => b.id === deleteBudget.id);
                arr.splice(index, 1);
                this.transactionService.updateTransactionCacheOnBudgetChange(deleteBudget.name, undefined, true);
                this._budgetSubject.next(arr);
                this.budgetMeToastrService.showSuccess('Budget deleted');
                return data;
            }
        );
    }

}
