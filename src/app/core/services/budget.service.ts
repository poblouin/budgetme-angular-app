import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from './error.service';
import { Budget } from '../models/budget';

@Injectable()
export class BudgetService {
    private API_PATH = '/budget';
    private _budgetSubject = new BehaviorSubject<Array<Budget>>(new Array<Budget>());

    public budgets = this._budgetSubject.asObservable();

    constructor(
        private apiService: ApiService,
        private errorService: ErrorService
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
            err => this.errorService.showError(err)
        );
        return obs;
    }

}
