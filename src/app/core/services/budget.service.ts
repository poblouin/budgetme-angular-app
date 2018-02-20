import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { ApiService } from '../../shared/services/api.service';
import { BudgetMeToastrService } from './toastr.service';
import { Budget } from '../models/budget';

@Injectable()
export class BudgetService {
    private API_PATH = '/budget';
    private _budgetSubject = new BehaviorSubject<Array<Budget>>(new Array<Budget>());

    public budgets = this._budgetSubject.asObservable();

    constructor(
        private apiService: ApiService,
        private budgetMeToastrService: BudgetMeToastrService
    ) { }

    getBudgets(): Observable<Array<Budget>> {
        const obs = this.apiService.get(this.API_PATH);
        obs.subscribe(
            data => {
                const arr = new Array<Budget>();
                data.budgets.forEach(element => {
                    arr.push(new Budget(element));
                });
                this._budgetSubject.next(arr);
            },
            err => this.budgetMeToastrService.showError(err)
        );
        return obs;
    }

    createBudget(saveBudget: Budget): Observable<Budget> {
        return this.apiService.post(this.API_PATH, saveBudget).map(
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

    updateBudget(updateBudget: Budget): Observable<Budget> {
        return this.apiService.put(this.API_PATH + `/${updateBudget.id}`, updateBudget).map(
            data => {
                const budget = new Budget(data.budget);
                const arr = this._budgetSubject.value;
                const index = arr.findIndex(b => b.id === updateBudget.id);
                arr[index] = budget;
                this._budgetSubject.next(arr);
                this.budgetMeToastrService.showSuccess('Budget updated');
                return budget;
            }
        );
    }

    deleteBudget(deleteBudget: Budget): Observable<Budget> {
        return this.apiService.delete(this.API_PATH + `/${deleteBudget.id}`).map(
            data => {
                const arr = this._budgetSubject.value;
                const index = arr.findIndex(b => b.id === deleteBudget.id);
                arr.splice(index, 1);
                this._budgetSubject.next(arr);
                this.budgetMeToastrService.showSuccess('Budget deleted');
                return data;
            }
        );
    }

}
