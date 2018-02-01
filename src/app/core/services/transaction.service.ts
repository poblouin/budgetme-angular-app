import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from './error.service';
import { Transaction } from 'app/core/models/transaction';

@Injectable()
export class TransactionService {
    private API_PATH = '/transaction';
    private _transactionSubject = new BehaviorSubject<Map<string, Array<Transaction>>>(new Map());

    public readonly transactions = this._transactionSubject.asObservable();

    constructor(
        private apiService: ApiService,
        private errorService: ErrorService
    ) { }

    getTransactions(budgetNames: Array<string>, periodStart: string, periodEnd: string): void {
        const sources = [];

        budgetNames.forEach(budgetName => {
            const param = new URLSearchParams();
            param.set('budget_name', budgetName);
            param.set('from_date', periodStart);
            param.set('to_date', periodEnd);
            sources.push(this.apiService.get('/transaction', param));
        });

        if (sources.length === 0) { return; }
        Observable.forkJoin(sources)
            .subscribe(
            (res: any) => {
                const transactionFilterCat = new Map<string, Array<Transaction>>();
                for (let i = 0; i < res.length; i++) {
                    const transactions = res[i].transactions;
                    transactions.forEach(e => {
                        const transaction = new Transaction(e);
                        const key = this.createKey(budgetNames[i], e.transaction_category.name, periodStart, periodEnd);
                        const arr = transactionFilterCat.get(key);
                        if (arr !== undefined) {
                            arr.push(transaction);
                        } else {
                            transactionFilterCat.set(key, [transaction]);
                        }
                    });
                }
                this._transactionSubject.next(transactionFilterCat);
            });
    }

    getTransactionsPerBudget(): Map<string, Array<Transaction>> {
        const newM = new Map<string, Array<Transaction>>();
        this._transactionSubject.getValue().forEach((transactions, key) => {
            const budgetName = this.getBudgetNameFromKey(key);
            const arr = newM.get(budgetName);
            if (arr !== undefined) {
                arr.push.apply(arr, transactions);
            } else {
                newM.set(budgetName, transactions);
            }
        });
        return newM;
    }

    private createKey(budgetName: string, catName: string, periodStart: string, periodEnd: string): string {
        return [budgetName, catName, periodStart, periodEnd].join('_');
    }

    private getBudgetNameFromKey(key: string): string {
        return key.split('_')[0];
    }

}
