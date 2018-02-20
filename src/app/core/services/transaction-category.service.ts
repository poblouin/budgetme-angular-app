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

    constructor(
        private apiService: ApiService,
        private budgetMeToastrService: BudgetMeToastrService
    ) { }

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

}
